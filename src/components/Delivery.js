import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

function Delivery() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [Name, setName] = useState('');
  const [Date, setDate] = useState('');
  const [Time, setTime] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/departments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDepartments(response.data);
      } catch (error) {
        setMessage(t('recoveringDptoError'));
        console.error(t('consoleDptoError'), error);
      }
    };

    fetchDepartments();
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const delivery = {
        department: selectedDepartment,
        Name, // Asegúrate de que coincida con el nombre del estado
        Date, // Asegúrate de que coincida con el nombre del estado
        Time // Asegúrate de que coincida con el nombre del estado
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/deliveries', delivery, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Delivery registered successfully');
      setSelectedDepartment('');
      setName('');
      setDate('');
      setTime('');
      console.log(response.data);
    } catch (error) {
      setMessage('Error registering delivery');
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container>
        <Row className="justify-content-md-center">
          <Col lg={6}>
            {message && <Alert variant={message.startsWith('Error') ? 'danger' : 'success'}>{message}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="deliveryForm.DepartmentSelect">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
                <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
                  <option value="">{t('selectDepartment')}</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.Number}>{dept.Number}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="deliveryForm.Name">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Name')}</Form.Label>
                <Form.Control
                  type="text"
                  value={Name}
                  onChange={e => setName(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Date">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={Date}
                  onChange={e => setDate(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Time">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Time')}</Form.Label>
                <Form.Control
                  type="time"
                  value={Time}
                  onChange={e => setTime(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className='my-4 btn-lg'>
                {t('Register Delivery')}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Delivery;
