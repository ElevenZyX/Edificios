import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container, Button, Alert } from 'react-bootstrap'; // Importa Alert de react-bootstrap
import { Navigate } from 'react-router-dom';

function NavBar() {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar la alerta

  const handleLogout = () => {
    // Mostrar la alerta después de cerrar sesión
    setShowAlert(true);
    // Redirigir a la página de inicio de sesión después de cerrar sesión
    setTimeout(() => {
      setLoggedOut(true);
    }, 1000); // Redirigir después de 3 segundos
  };

  const [loggedOut, setLoggedOut] = useState(false); // Estado para el cierre de sesión

  // Redirigir a la página de inicio de sesión después del cierre de sesión
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
              <Nav.Link href="/Home" className="navbar-link" style={{ fontSize: '1.2rem' }}>{t('home')}</Nav.Link>
              <Nav.Link href="/correspondencia" className="navbar-link" style={{ fontSize: '1.2rem' }}>{t('delivery')}</Nav.Link>
              <Nav.Link href="/Visit" className="navbar-link" style={{ fontSize: '1.2rem' }}>{t('visitors')}</Nav.Link>
              <Nav.Link href="/vehiculos" className="navbar-link" style={{ fontSize: '1.2rem' }}>{t('vehicles')}</Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>{t('logout')}</Button> {/* Botón de logout */}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Mostrar la alerta después de hacer clic en el botón de logout */}
      {showAlert && (
        <Alert className= "mt-3" variant="success" onClose={() => setShowAlert(false)} dismissible>
          {t('logoutSuccessMessage')}
        </Alert>
      )}
    </>
  );
}

export default NavBar;
