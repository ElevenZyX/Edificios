import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext'; // Importa el contexto de autenticación

function Delivery() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth(); // Obtén la información del usuario y el estado de autenticación
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [typeOfPackage, setTypeOfPackage] = useState('');
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user || !user._id) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/departments/${user._id}`, {
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
  }, [t, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const delivery = {
        department: selectedDepartment,
        typeOfPackage,
        company,
        date,
        time
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/deliveries', delivery, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Delivery registered successfully');
      setSelectedDepartment('');
      setTypeOfPackage('');
      setCompany('');
      setDate('');
      setTime('');
      console.log(response.data);
    } catch (error) {
      setMessage('Error registering delivery');
      console.error('Error submitting form:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>{t('loading')}</div>;
  }

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

              <Form.Group controlId="deliveryForm.TypeOfPackage">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Type of package')}</Form.Label>
                <Form.Control
                  type="text"
                  value={typeOfPackage}
                  onChange={e => setTypeOfPackage(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Company">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Company')}</Form.Label>
                <Form.Control
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Date">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Time">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Time')}</Form.Label>
                <Form.Control
                  type="time"
                  value={time}
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
