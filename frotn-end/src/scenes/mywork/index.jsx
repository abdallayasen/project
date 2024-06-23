import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";


const Mywork  = () => {
    return (
        <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Mywork" subtitle="here we gonna display Mywork" />
          </Box>
        </Box>
    );
};

export default Mywork;