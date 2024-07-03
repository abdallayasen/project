import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  // Add your authentication logic here
  const isAuthenticated = true; // Replace this with actual authentication check
  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/login" />}
    />
  );
}

export default PrivateRoute;
