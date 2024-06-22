// Vehicles.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from './NavBar'; 
import Footer from './Footer'; 
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext';

function Vehicles() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [parking, setParking] = useState(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        console.log(`Fetching parking data for ${user.name}`);
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

  const handleEnter = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/parking/${user.name}/enter`,
        { licensePlate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
      setLicensePlate('');
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
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default Vehicles;
