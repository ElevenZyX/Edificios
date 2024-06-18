import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container, Button, Alert } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Importa el contexto de autenticación
import { LinkContainer } from 'react-router-bootstrap';  // Asegúrate de importar LinkContainer

function NavBar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth(); // Usa el contexto de autenticación
  const [showAlert, setShowAlert] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    setShowAlert(true);
    setTimeout(() => {
      setLoggedOut(true);
    }, 1000); // Redirigir después de 1 segundo
  };

  if (loggedOut) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <style>
        {`
          .navbar-link:hover {
            background-color: #C2FAFB;
            border-radius: 10px;
          }
        `}
      </style>
      <Navbar bg="info" expand="lg" className="mx-3 my-3 rounded">
        <Container fluid>
          <LinkContainer to="/home">
            <Navbar.Brand style={{ fontSize: '1.5rem', cursor: 'pointer' }}>{t('welcome')}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="w-100 justify-content-evenly" style={{ fontSize: '1.2rem' }}>
              <LinkContainer to="/home">
                <Nav.Link className="navbar-link">{t('home')}</Nav.Link>
              </LinkContainer>
              {/* Agrega el enlace al componente Delivery */}
              <LinkContainer to="/delivery">
                <Nav.Link className="navbar-link">{t('delivery')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/visit">
                <Nav.Link className="navbar-link">{t('visitors')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/vehiculos">
                <Nav.Link className="navbar-link">{t('vehicles')}</Nav.Link>
              </LinkContainer>
            </Nav>
            {isAuthenticated && (
              <Button variant="outline-light" onClick={handleLogout}>{t('logout')}</Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAlert && (
        <Alert className="mt-3" variant="success" onClose={() => setShowAlert(false)} dismissible>
          {t('logoutSuccessMessage')}
        </Alert>
      )}
    </>
  );
}

export default NavBar;
