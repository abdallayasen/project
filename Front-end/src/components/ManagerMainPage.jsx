import React from 'react';
import { Box, useTheme } from '@mui/material';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { tokens } from '../../src/theme';
import Topbar from '../../src/scenes/global/Topbar';
import Sidebar from '../../src/scenes/global/Sidebar';
import Dashboard from '../../src/scenes/dashboard';
import Customer from '../../src/scenes/customer';
import Employee from '../../src/scenes/employee';
import Work from '../../src/scenes/work';
import Geography from '../../src/scenes/geography';
import Mywork from '../../src/scenes/mywork';
import Allwork from '../../src/scenes/allwork';
import Comments from '../../src/scenes/comments';
import ClientInfo from '../../src/scenes/customer';

const ManagerMainPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flexGrow={1} bgcolor={colors.primary[400]}>
        <Topbar onLogout={handleLogout} />
        <Box p={2}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/mywork" element={<Mywork />} />
            <Route path="/allwork" element={<Allwork />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/work" element={<Work />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/client-info" element={<ClientInfo />} />

          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default ManagerMainPage;
