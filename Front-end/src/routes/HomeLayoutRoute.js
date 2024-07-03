import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const HomeLayoutRoute = ({ element: Element, ...rest }) => {
  // You can add your layout logic here
  return (
    <Route
      {...rest}
      element={<Element />}
    />
  );
}

export default HomeLayoutRoute;
