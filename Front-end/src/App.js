// App.js
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar"; // Ensure Sidebar is imported
// Import your pages
import Dashboard from "./scenes/dashboard"; 
import Customer from "./scenes/customer";
import Employee from "./scenes/employee";
import Work from "./scenes/work";
import Geography from "./scenes/geography";
import Mywork from "./scenes/mywork";
import Allwork from "./scenes/allwork";
import Comments from "./scenes/comments";
import AddPost from "./components/AddPost";
import LoginPage from "./components/LoginPage/LoginPage";
import SignUp from "./components/LoginPage/SignUp";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Dashboard />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/customer" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Customer />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/employee" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Employee />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/workmanage" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Work />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/geography" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Geography />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/mywork" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Mywork />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/allwork" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Allwork />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/comments" element={
            <Box display="flex">
              <Sidebar />
              <Box flexGrow={1}>
                <Topbar />
                <Box p={2} flexGrow={1}>
                  <Comments />
                </Box>
              </Box>
            </Box>
          } />
          {/* Add more routes here */}
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
