import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from './NavBar'; 
import Footer from './Footer'; 
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext';

const validateLicensePlate = (plate) => {
  const licensePlateRegex = /^[A-Za-z0-9]{6}$/;
  return licensePlateRegex.test(plate);
};

function Vehicles() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [parking, setParking] = useState(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        console.log(`Fetching parking data for ${user.name} with token: ${token}`);
        const response = await axios.get(`http://localhost:8000/api/parking/${user.name}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data);
        setParking(response.data);
      } catch (error) {
        console.error('Error fetching parking data:', error);
        setMessage('Error fetching parking data');
        setTimeout(() => setMessage(null), 4000);
      }
    };
    fetchParking();
  }, [user.name, token]);

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
        setTimeout(() => setMessage(null), 4000);
      }
    };

    fetchDepartments();
  }, [t, user]);

  const handleEnter = async () => {
    if (!validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/frequent/rut/${licensePlate.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.name.toLowerCase() === user.name.toLowerCase()) {
        const frequentUser = response.data;
        const { nombre, Number } = frequentUser;

        const postResponse = await axios.post(
          `http://localhost:8000/api/parking/${user.name}/enter`,
          { licensePlate: licensePlate.toUpperCase(), nombre, department: Number },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setParking(postResponse.data);
        setLicensePlate('');
        setName('');
        setDepartment('');
      } else {
        setMessage(t('platerror'));
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(t('RUTnoRegistred'));
        setShowManualForm(true);
        setName('');
        setDepartment('');
      } else {
        console.error('Error registering vehicle:', error);
        setMessage('Error registering vehicle');
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8000/api/parking/${user.name}/enter`,
        { licensePlate: licensePlate.toUpperCase(), nombre: name, department },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
      setLicensePlate('');
      setName('');
      setDepartment('');
      setShowManualForm(false); // Ocultar el formulario manual después de enviar los datos correctamente
    } catch (error) {
      console.error('Error registering vehicle:', error);
      setMessage('Error registering vehicle');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleExit = async (plate) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/parking/${user.name}/exit`,
        { licensePlate: plate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
    } catch (error) {
      console.error('Error removing vehicle:', error);
      setMessage('Error removing vehicle');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container fluid style={{ flex: "1" }}>
        <h1 className="mt-5">{t('vehicles')}</h1>
        {message && <Alert variant="danger">{message}</Alert>}
        {parking && (
          <>
            <h2>{t('totalSpaces')}: {parking.spaces}</h2>
            <h3>{t('occupiedSpaces')}: {parking.occupiedSpaces.length}</h3>
            <Row>
              {Array.from({ length: parking.spaces }, (_, i) => (
                <Col key={i} className="mb-3">
                  <div className="p-3 border bg-light">
                    <p>{t('spaceAvailable', { space: i + 1 })}</p>
                    {parking.occupiedSpaces[i] ? (
                      <>
                        <p>{t('licensePlate')}: {parking.occupiedSpaces[i].licensePlate}</p>
                        <p>{t('name')}: {parking.occupiedSpaces[i].nombre}</p>
                        <p>{t('department')}: {parking.occupiedSpaces[i].department}</p>
                        <Button variant="danger" onClick={() => handleExit(parking.occupiedSpaces[i].licensePlate)}>
                          {t('exit')}
                        </Button>
                      </>
                    ) : (
                      <p>{t('available')}</p>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
            <Form>
              <Form.Group controlId="formLicensePlate">
                <Form.Label>{t('enterLicensePlate')}</Form.Label>
                <Form.Control
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Form.Group>
              <Button onClick={handleEnter}>{t('enter')}</Button>
            </Form>
            {showManualForm && (
              <Form onSubmit={handleManualSubmit}>
                <Form.Group controlId="formName">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formDepartment">
                  <Form.Label>{t('department')}</Form.Label>
                  <Form.Control
                    as="select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">{t('selectDepartment')}</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept.Number}>{dept.Number}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button type="submit">{t('enter')}</Button>
              </Form>
            )}
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default Vehicles;
