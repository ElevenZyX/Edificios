import React from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from './NavBar'; 
import Footer from './Footer'; 
import { Container } from 'react-bootstrap';

function Home() {
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container fluid style={{ flex: "1" }}>
        <h1 className="mt-5">{t('welcomeToHomePage')}</h1>
      </Container>
      <Footer />
    </div>
  );
}

export default Home;
