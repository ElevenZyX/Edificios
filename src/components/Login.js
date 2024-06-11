import React, { useState } from 'react';
import axios from './axiosConfig'; // Usa la configuración de Axios
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Footer from './Footer';
import { useAuth } from './AuthContext';
import logo from '../img/logo.png'; // Importa la imagen del logo

function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', {
        username,
        password,
      });
      if (response.data.token) {
        login(response.data.token);
        navigate('/home');
      } else {
        setError(t('userNotRegistered'));
      }
    } catch (e) {
      setError(t('loginError'));
      console.log(e);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px', // Agrega un poco de padding para móviles
  };

  const logoStyle = {
    width: '100%', // Asegura que el logo ocupe el ancho completo del contenedor
    maxWidth: '600px', // Limita el ancho máximo para que coincida con el contenedor del formulario
    height: 'auto', // Mantiene la proporción del logo
    marginBottom: '20px', // Espaciado constante entre el logo y el contenedor del formulario
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 20px',
  };

  return (
    <div style={containerStyle}>
      <header className="w-100 text-center">
        <img src={logo} alt="BuildingBuddyy Logo" style={logoStyle} /> {/* Usa la imagen del logo */}
      </header>
      <main className="flex-grow-1 w-100 d-flex flex-column align-items-center justify-content-start">
        <Row className="justify-content-center p-3 bg-info rounded" style={formContainerStyle}>
          <Col xs={12}>
            <div>
              <h1 className="text-center">{t('login')}</h1>
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
                <Button variant="primary" type="submit" className="btn-lg w-100">
                  {t('login')}
                </Button>
              </Form>
              <br />
            </div>
          </Col>
        </Row>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
