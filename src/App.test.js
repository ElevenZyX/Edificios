// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './components/i18n';
import App from './App';
import { AuthProvider } from './components/AuthContext';

test('renders BuildingBuddyy title', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nextProvider>
  );

  // Verificar que el título "BuildingBuddyy" está en el documento
  const titleElement = screen.getByText(/BuildingBuddyy/i);
  expect(titleElement).toBeInTheDocument();
});
