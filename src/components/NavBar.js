import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container, Button, Alert } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import * as Sentry from "@sentry/react";  // Asegúrate de que Sentry está importado

function NavBar() {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const handleLogout = () => {
    setShowAlert(true);
    setTimeout(() => {
      setLoggedOut(true);
    }, 1000);
  };

  // Función para loggear el evento de selección de "Correspondencia"
  const handleCorrespondenciaClick = () => {
    Sentry.captureMessage('Usuario seleccionó Correspondencia', 'info');
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
          <Navbar.Brand className='ml-3' href="/home" style={{ fontSize: '1.5rem' }}>{t('welcome')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="w-100 justify-content-evenly" style={{ fontSize: '1.2rem' }}>
              <Nav.Link href="/Home" className="navbar-link">{t('home')}</Nav.Link>
              <Nav.Link href="/correspondencia" className="navbar-link" onClick={handleCorrespondenciaClick}>{t('delivery')}</Nav.Link>
              <Nav.Link href="/Visit" className="navbar-link">{t('visitors')}</Nav.Link>
              <Nav.Link href="/vehiculos" className="navbar-link">{t('vehicles')}</Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>{t('logout')}</Button>
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
