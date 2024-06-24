import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";


const Home  = () => {
    return (
        <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Home" subtitle="Welcome to your dashboard, here we may display dashboards and Sticker Notes" />
          </Box>
        </Box>
    );
};

export default Home;