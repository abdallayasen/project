import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Retrieve user data from localStorage if it exists
  const storedUser = JSON.parse(localStorage.getItem('user')) || { name: '', userType: '' };
  
  const [user, setUser] = useState(storedUser);

  // Whenever user data is updated, save it to localStorage
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
