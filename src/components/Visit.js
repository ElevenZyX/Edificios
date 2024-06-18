import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

const validateRut = (rut) => {
  const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
  return rutRegex.test(rut);
};

function Visit() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // Estado para el tipo de mensaje
  const [view, setView] = useState(null); // Estado para manejar la vista
  const [isRUTVerified, setIsRUTVerified] = useState(false); // Estado para verificar si el RUT está registrado

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
        setMessageType('danger');
        console.error(t('consoleDptoError'), error);
      }
    };

    fetchDepartments();
  }, [t, user]);

  const handleRUTSubmit = async (e) => {
    e.preventDefault();
    if (!validateRut(rut)) {
      setMessage(t('ruterror'));
      setMessageType('danger');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/users/rut/${rut}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setNombre(response.data.name);
        setSelectedDepartment(response.data.department);
        setIsRUTVerified(true);
      } else {
        setMessage('RUT no registrado, por favor ingrese todos los datos.');
        setMessageType('warning');
        setIsRUTVerified(false);
      }
    } catch (error) {
      setMessage('Error al verificar el RUT');
      setMessageType('danger');
      console.error('Error:', error);
    }
  };

  const handleFrequentSubmit = async (e) => {
    e.preventDefault();
    if (!validateRut(rut)) {
      setMessage(t('ruterror'));
      setMessageType('danger');
      return;
    }
    try {
      const frequentVisit = {
        Number: selectedDepartment,
        nombre,
        rut,
        name: user.name // Nombre del edificio que el usuario representa
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/frequent', frequentVisit, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(t('visitpass'));
      setMessageType('success');
      setSelectedDepartment('');
      setNombre('');
      setRut('');
    } catch (error) {
      setMessage(t('visiterror'));
      setMessageType('danger');
      console.error('Error:', error);
    }
  };

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
      setMessageType('success');
      setSelectedDepartment('');
      setNombre('');
      setFecha('');
      setHora('');
      setIsRUTVerified(false); // Resetear verificación de RUT
    } catch (error) {
      setMessage('Error al registrar la visita');
      setMessageType('danger');
      console.error('Error al enviar el formulario:', error);
    }
  };

  const renderButtons = () => (
    <div>
      <Button onClick={() => setView('frequent')} variant="primary" className="m-2">
        {t("RegisterFrequent")}
      </Button>
      <Button onClick={() => setView('building')} variant="secondary" className="m-2">
        Registrar una visita al edificio
      </Button>
    </div>
  );

  const renderRUTForm = () => (
    <Form onSubmit={handleRUTSubmit}>
      <Form.Group controlId="rutForm.Rut">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('rut')}</Form.Label>
        <Form.Control
          type="text"
          value={rut}
          onChange={e => setRut(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Button variant="primary" type="submit" className='my-4 btn-lg'>
        {t('verifyRUT')}
      </Button>
      <Button variant="secondary" onClick={() => setView(null)} className='my-4 btn-lg'>
        Volver
      </Button>
    </Form>
  );

  const renderFrequentForm = () => (
    <Form onSubmit={handleFrequentSubmit}>
      <Form.Group controlId="frequentForm.DepartmentSelect">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
        <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
          <option value="">{t('selectDepartment')}</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept.Number}>{dept.Number}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="frequentForm.Nombre">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
        <Form.Control
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Form.Group controlId="frequentForm.Rut">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('rut')}</Form.Label>
        <Form.Control
          type="text"
          value={rut}
          onChange={e => setRut(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit" className='my-4 btn-lg'>
          Registrar Visita Frecuente
        </Button>
        <Button variant="secondary" onClick={() => setView(null)} className='my-4 btn-lg'>
          Volver
        </Button>
      </div>
    </Form>
  );

  const renderFullForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="visitasForm.Nombre">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
        <Form.Control
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Form.Group controlId="visitasForm.DepartmentSelect">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
        <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
          <option value="">{t('selectDepartment')}</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept.Number}>{dept.Number}</option>
          ))}
        </Form.Control>
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

      <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit" className='my-4 btn-lg'>
          {t('registerVisit')}
        </Button>
        <Button variant="secondary" onClick={() => { setView(null); setIsRUTVerified(false); }} className='my-4 btn-lg'>
          Volver
        </Button>
      </div>
    </Form>
  );

  const renderPartialForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="visitasForm.Nombre">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
        <Form.Control
          type="text"
          value={nombre}
          readOnly
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Form.Group controlId="visitasForm.DepartmentSelect">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
        <Form.Control
          type="text"
          value={selectedDepartment}
          readOnly
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

      <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit" className='my-4 btn-lg'>
          {t('registerVisit')}
        </Button>
        <Button variant="secondary" onClick={() => { setView(null); setIsRUTVerified(false); }} className='my-4 btn-lg'>
          Volver
        </Button>
      </div>
    </Form>
  );

  if (!isAuthenticated) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container>
        <Row className="justify-content-md-center">
          <Col lg={6}>
            {message && <Alert variant={messageType}>{message}</Alert>}
            {view === 'frequent' ? renderFrequentForm() : view === 'building' ? (isRUTVerified ? renderPartialForm() : renderRUTForm()) : renderButtons()}
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Visit;
