import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";


const Allwork  = () => {
    return (
        <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Archive FileSystem" subtitle="here we gonna display DataBase Archive FileSystem for Previous Work" />
          </Box>
        </Box>
    );
};

export default Allwork;