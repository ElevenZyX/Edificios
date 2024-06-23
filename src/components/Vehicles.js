import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from './NavBar';
import Footer from './Footer';
import { Container, Row, Col, Button, Form, Alert, Modal } from 'react-bootstrap';
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
  const [maxHours, setMaxHours] = useState(1); // default max time in hours
  const [notificationMinutes, setNotificationMinutes] = useState(15); // default notification time in minutes
  const [showNotification, setShowNotification] = useState(false);

  const convertToMinutes = (hours) => {
    return hours * 60;
  };

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/parking/${user.name}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParking(response.data);
      } catch (error) {
        setMessage('Error fetching parking data');
        setTimeout(() => setMessage(null), 4000);
      }
    };

    fetchParking();
  }, [user.name, token]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data;
        setMaxHours(userData.hour);
        setNotificationMinutes(userData.alert);
      } catch (error) {
        setMessage('Error fetching user settings');
        setTimeout(() => setMessage(null), 4000);
      }
    };

    fetchUserSettings();
  }, [user._id, token]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (parking) {
        const maxTimeInMinutes = convertToMinutes(maxHours);
        parking.occupiedSpaces.forEach(space => {
          const currentTime = new Date();
          const parkedTime = new Date(space.parkedAt);
          const elapsedTime = (currentTime - parkedTime) / 60000; // elapsed time in minutes
          const timeRemaining = maxTimeInMinutes - elapsedTime;

          if (timeRemaining <= notificationMinutes && timeRemaining > 0 && !showNotification) {
            setShowNotification(true);
          }
        });
      }
    }, 60000); // check every minute

    return () => clearInterval(timer);
  }, [parking, maxHours, notificationMinutes, showNotification]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/departments/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      setMessage('Error fetching departments');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleEnter = async (e) => {
    e.preventDefault();  // Prevent default form submission behavior
    if (!validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/frequent/car/${licensePlate.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.name.toLowerCase() === user.name.toLowerCase()) {
        const frequentUser = response.data;
        const { nombre, Number: department } = frequentUser;  // Aquí aseguramos que el campo correcto sea asignado

        const postResponse = await axios.post(
          `http://localhost:8000/api/parking/${user.name}/enter`,
          { licensePlate: licensePlate.toUpperCase(), nombre, department, parkedAt: new Date() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setParking(postResponse.data);
        setLicensePlate('');
        setName('');
        setDepartment('');
        setShowManualForm(false);
      } else {
        setMessage(t('platerror'));
        setShowManualForm(true);
        fetchDepartments();
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(t('RUTnoRegistred'));
        setShowManualForm(true);
        fetchDepartments();
        setName('');
        setDepartment('');
      } else {
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
      const response = await axios.post(
        `http://localhost:8000/api/parking/${user.name}/enter`,
        { licensePlate: licensePlate.toUpperCase(), nombre: name, department, parkedAt: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
      setLicensePlate('');
      setName('');
      setDepartment('');
      setShowManualForm(false);
    } catch (error) {
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
                    {parking.occupiedSpaces[i] ? (
                      <>
                        <p>{t('licensePlate')}: {parking.occupiedSpaces[i].licensePlate}</p>
                        <p>{t('name')}: {parking.occupiedSpaces[i].nombre}</p>
                        <p>{t('department')}: {parking.occupiedSpaces[i].department}</p>
                        <p>{t('timeRemaining')}: {Math.max(0, (convertToMinutes(maxHours) - ((new Date() - new Date(parking.occupiedSpaces[i].parkedAt)) / 60000)).toFixed(2))} min</p>
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
            <Form className="text-center" onSubmit={handleEnter}>
              <Form.Group controlId="formLicensePlate">
                <Form.Label>{t('enterLicensePlate')}</Form.Label>
                <Form.Control
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Form.Group>
              {!showManualForm && (
                <Button className="mt-3" type="submit">{t('enter')}</Button>
              )}
            </Form>
            {showManualForm && (
              <Form onSubmit={handleManualSubmit} className="text-center mt-3">
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
                <Button type="submit" className="mt-3">{t('enter')}</Button>
              </Form>
            )}
          </>
        )}
      </Container>
      <Footer />
      <Modal show={showNotification} onHide={() => setShowNotification(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('notification')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('timeAlmostUp')}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowNotification(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Vehicles;
