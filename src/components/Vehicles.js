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
  const [maxHours, setMaxHours] = useState(() => {
    return parseInt(localStorage.getItem('maxHours')) || 1;
  });
  const [maxMinutes, setMaxMinutes] = useState(() => {
    return parseInt(localStorage.getItem('maxMinutes')) || 0;
  });
  const [notificationMinutes, setNotificationMinutes] = useState(() => {
    return parseInt(localStorage.getItem('notificationMinutes')) || 15;
  });
  const [showNotification, setShowNotification] = useState(false);

  const convertToMinutes = (hours, minutes) => {
    return hours * 60 + minutes;
  };

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
  }, [t, user, token]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (parking) {
        const maxTimeInMinutes = convertToMinutes(maxHours, maxMinutes);
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
  }, [parking, maxHours, maxMinutes, notificationMinutes, showNotification]);

  useEffect(() => {
    localStorage.setItem('maxHours', maxHours);
  }, [maxHours]);

  useEffect(() => {
    localStorage.setItem('maxMinutes', maxMinutes);
  }, [maxMinutes]);

  useEffect(() => {
    localStorage.setItem('notificationMinutes', notificationMinutes);
  }, [notificationMinutes]);

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
        <Form className="text-center mb-4">
          <Form.Group controlId="formMaxTimeHours">
            <Form.Label>{t('maximumTimeHours')}</Form.Label>
            <Form.Control
              type="number"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              min="0"
            />
          </Form.Group>
          <Form.Group controlId="formMaxTimeMinutes">
            <Form.Label>{t('maximumTimeMinutes')}</Form.Label>
            <Form.Control
              type="number"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(e.target.value)}
              min="0"
            />
          </Form.Group>
          <Form.Group controlId="formNotificationTime">
            <Form.Label>{t('notificationTimeMinutes')}</Form.Label>
            <Form.Control
              type="number"
              value={notificationMinutes}
              onChange={(e) => setNotificationMinutes(e.target.value)}
              min="1"
            />
          </Form.Group>
        </Form>
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
                        <p>{t('timeRemaining')}: {Math.max(0, (convertToMinutes(maxHours, maxMinutes) - ((new Date() - new Date(parking.occupiedSpaces[i].parkedAt)) / 60000)).toFixed(2))} min</p>
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
