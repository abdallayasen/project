import { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

 
//import Team from "./scenes/team"; 
//import Geography from "./scenes/geography"; 


function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex">
          <Sidebar />
          <Box flexGrow={1}>
            <Topbar />
            
            <Box p={2} flexGrow={1}>
              <Routes>
                  <Route path="/" element={< Dashboard />} />
                  <Route path="/customer" element={< Customer />} /> 
                  <Route path="/employee" element={< Employee />} /> 
                  <Route path="/workmanage" element={< Work />} /> 
                  <Route path="/geography" element={< Geography />} /> 
                  <Route path="/mywork" element={< Mywork />} /> 
                  <Route path="/allwork" element={< Allwork />} /> 
                  <Route path="/comments" element={< Comments />} /> 

                
                {/* Add more routes here */}
              </Routes>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

// remember :  in Route path you type whatever /name you need, in the element you put the imported model from this page.
