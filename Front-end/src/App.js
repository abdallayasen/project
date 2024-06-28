import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import LoginPage from './components/LoginPage/LoginPage';
import SignUp from './components/LoginPage/SignUp';
import ManagerMainPage from './components/ManagerMainPage';

function App() {
  const [theme, colorMode] = useMode();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleOpenSignUp = () => {
    setIsSignUpOpen(true);
  };

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp onClose={handleCloseSignUp} />} />
          <Route path="/manager/*" element={<ManagerMainPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        {isSignUpOpen && <SignUp onClose={handleCloseSignUp} />}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
