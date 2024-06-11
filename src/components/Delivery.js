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
  const [Company, setCompany] = useState('');
  const [Description, setDescription] = useState('');
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDepartment) newErrors.selectedDepartment = 'Department is required';
    if (!Name) newErrors.Name = 'Name is required';
    if (!Date) newErrors.Date = 'Date is required';
    if (!Company) newErrors.Company = 'Company is required';
    if (!Description) newErrors.Description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const delivery = {
        department: selectedDepartment,
        Name,
        Date,
        Company,
        Description
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
      setCompany('');
      setDescription('');
      console.log(response.data);
      handlePrint(); // Llamar a la función para generar y descargar el PDF
    } catch (error) {
      setMessage('Error registering delivery');
      console.error('Error submitting form:', error);
    }
  };

  // Función para imprimir la información
  const handlePrint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/deliveries/pdf', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error printing:', error);
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
                {errors.selectedDepartment && <Alert variant="danger">{errors.selectedDepartment}</Alert>}
              </Form.Group>

              <Form.Group controlId="deliveryForm.Name">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Name')}</Form.Label>
                <Form.Control
                  type="text"
                  value={Name}
                  onChange={e => setName(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
                {errors.Name && <Alert variant="danger">{errors.Name}</Alert>}
              </Form.Group>

              <Form.Group controlId="deliveryForm.Date">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('Date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={Date}
                  onChange={e => setDate(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
                {errors.Date && <Alert variant="danger">{errors.Date}</Alert>}
              </Form.Group>

              <Form.Group controlId="deliveryForm.Company">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Company</Form.Label>
                <Form.Control
                  type="text"
                  value={Company}
                  onChange={e => setCompany(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
                {errors.Company && <Alert variant="danger">{errors.Company}</Alert>}
              </Form.Group>

              <Form.Group controlId="deliveryForm.Description">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={Description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
                {errors.Description && <Alert variant="danger">{errors.Description}</Alert>}
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
