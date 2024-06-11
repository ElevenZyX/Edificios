import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Visit from './components/Visit'; // Importado el componente Visit
import Delivery from './components/Delivery'; // Importado el componente Delivery
import LanguageSelector from './components/LanguageSelector';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Container>
          <LanguageSelector />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/visit" // Ruta para el componente Visit
              element={
                <PrivateRoute>
                  <Visit />
                </PrivateRoute>
              }
            />
            <Route
              path="/delivery" // Ruta para el componente Delivery
              element={
                <PrivateRoute>
                  <Delivery />
                </PrivateRoute>
              }
            />
            {/* Agrega más rutas protegidas aquí */}
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
