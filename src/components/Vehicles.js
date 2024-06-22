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
        const response = await axios.get(`/api/parking/${user.name}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParking(response.data);
      } catch (error) {
        setMessage('Error fetching parking data');
      }
    };
    fetchParking();
  }, [user.name, token]);

  const handleEnter = async () => {
    try {
      const response = await axios.post(
        `/api/parking/${user.name}/enter`,
        { licensePlate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
      setLicensePlate('');
    } catch (error) {
      setMessage('Error registering vehicle');
    }
  };

  const handleExit = async (plate) => {
    try {
      const response = await axios.post(
        `/api/parking/${user.name}/exit`,
        { licensePlate: plate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
    } catch (error) {
      setMessage('Error removing vehicle');
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container fluid style={{ flex: "1" }}>
        <h1 className="mt-5">{t('vehicles')}</h1>
        {message && <Alert variant="danger">{message}</Alert>}
        {user.parking && (
          <>
            <h2>{t('totalSpaces')}: {user.parking}</h2>
            <Row>
              {Array.from({ length: user.parking }, (_, i) => (
                <Col key={i} className="mb-3">
                  <div className="p-3 border bg-light">
                    <p>{t('spaceAvailable', { space: i + 1 })}</p>
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
