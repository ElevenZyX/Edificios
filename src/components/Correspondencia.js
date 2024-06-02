import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import NavBar from './NavBar';
import Footer from './Footer';
import * as Sentry from "@sentry/react";

function Correspondencia() {
    function logDebug() {
        Sentry.captureMessage('Debug: Intento de conexión a base de datos', 'debug');
    }

    function logError() {
      // Crear el error con un mensaje descriptivo
      const error = new Error('Falla al procesar la solicitud en Correspondencia');
      // También puedes agregar detalles adicionales al error si es necesario
      error.details = 'Base de datos no conectada';
      // Capturar el error con Sentry
      Sentry.captureException(error);
  }
  

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <NavBar />
            <Container>
                <Row className="justify-content-md-center">
                    <Col lg={6} className="text-center">
                        <Button variant="primary" onClick={logDebug} className="m-2">Registrar una correspondencia</Button>
                        <Button variant="danger" onClick={logError} className="m-2">Log Error</Button>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
}

export default Correspondencia;
