// Visit.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

function Visit() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user || !user._id) return;

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
      const visita = {
        departamento: selectedDepartment,
        nombre,
        fecha,
        hora
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/visitas', visita, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Visita registrada con éxito');
      setSelectedDepartment('');
      setNombre('');
      setFecha('');
      setHora('');
      console.log(response.data);
    } catch (error) {
      setMessage('Error al registrar la visita');
      console.error('Error al enviar el formulario:', error);
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
              <Form.Group controlId="visitasForm.DepartmentSelect">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
                <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
                  <option value="">{t('selectDepartment')}</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.Number}>{dept.Number}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="visitasForm.Nombre">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
                <Form.Control
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="visitasForm.Fecha">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Form.Group controlId="visitasForm.Hora">
                <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('time')}</Form.Label>
                <Form.Control
                  type="time"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className='my-4 btn-lg'>
                {t('registerVisit')}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Visit;
