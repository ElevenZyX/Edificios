// src/components/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Ajusta la ruta según sea necesario
import Login from './Login';
import { AuthProvider } from './AuthContext';
import axios from './axiosConfig';

jest.mock('./axiosConfig', () => ({
  post: jest.fn(() => Promise.resolve({ data: { token: 'test-token' } }))
}));

test('renders login form and submits successfully', async () => {
  render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  );

  // Verificar que los elementos están en el documento
  expect(screen.getByPlaceholderText(/login.username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/login.password/i)).toBeInTheDocument();
  expect(screen.getByText(/login/i)).toBeInTheDocument();

  // Simular entrada de usuario
  fireEvent.change(screen.getByPlaceholderText(/login.username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByPlaceholderText(/login.password/i), { target: { value: 'password' } });

  // Simular envío del formulario
  fireEvent.click(screen.getByText(/login/i));

  // Verificar si la función login fue llamada correctamente
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/login', {
      username: 'testuser',
      password: 'password'
    });
  });
});
