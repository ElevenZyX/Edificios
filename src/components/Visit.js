import React from 'react';
import { useAuth } from './AuthContext';

function Visit() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Welcome to the Visit Page</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Visit;
