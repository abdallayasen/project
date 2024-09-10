// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import LoginPage from './components/LoginPage/LoginPage';
import SignUp from './components/LoginPage/SignUp';
import ManagerMainPage from './components/ManagerMainPage';
import CustomerMainPage from './components/CustomerMainPage';
import Employee_Office_MainPage from './components/Employee_Office_MainPage';
import Field_Worker_MainPage from './components/Field_Worker_MainPage';
import AddOrder from './scenes/orders/AddOrder';
import Work from './scenes/work';
import MyWork from './scenes/mywork';
import { UserProvider } from './context/UserContext';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <UserProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/manager/*" element={<ManagerMainPage />} />
            <Route path="/customermainpage/*" element={<CustomerMainPage />} />
            <Route path="/employee-office-main/*" element={<Employee_Office_MainPage />} />
            <Route path="/field-worker-main/*" element={<Field_Worker_MainPage />} />
            <Route path="/manager/add-order" element={<AddOrder />} />
            <Route path="/work-management" element={<Work />} />
            <Route path="/my-work" element={<MyWork />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />

          </Routes>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </UserProvider>
  );
}

export default App;
