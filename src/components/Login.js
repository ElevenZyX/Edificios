import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Footer from './Footer'; // Importa el componente de footer
import log from 'loglevel'; // Import loglevel

log.setLevel('DEBUG'); // Set log level to DEBUG for development purposes

function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    log.info("Intentando iniciar sesión para el usuario:", username); // Log INFO

    try {
      const response = await axios.post("http://localhost:8000/", {
        username, password
      });
      if (response.data === "exist") {
        navigate("/Home", { state: { id: username } });
      } else if (response.data === "notexist") {
        alert(t('userNotRegistered'));
      }
    } catch (e) {
      setError(t('loginError'));
      log.error("Error al intentar conectar a la base de datos para el login:", e); // Log ERROR
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <header>
        <h1 className='text-primary text-center display-2'>BuildingBuddyy</h1>
      </header>
      <main className="flex-grow-1">
        <Row className="justify-content-center mt-5 p-3 bg-info rounded mx-3">
          <Col xs={12} sm={8} md={6}>
            <div>
              <h1>{t('login')}</h1>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="my-4" controlId="formBasicUsername">
                  <Form.Control
                    type="text"
                    placeholder={t('login.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    placeholder={t('login.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control-lg"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="btn-lg">
                  {t('login')}
                </Button>
              </Form>
              <br />
            </div>
          </Col>
        </Row>
      </main>
      <Footer /> {/* Agrega el componente de footer */}
    </div>
  );
}

export default Login;
