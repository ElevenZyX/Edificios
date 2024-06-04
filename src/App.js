import React from 'react';
import { Container } from 'react-bootstrap';
import Login from './components/Login';
import Home from './components/Home';
import Visit from './components/Visit';
import LanguageSelector from './components/LanguageSelector';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
              path="/visit"
              element={
                <PrivateRoute>
                  <Visit />
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
