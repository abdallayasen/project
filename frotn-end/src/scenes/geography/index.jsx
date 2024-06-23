import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";


const geography  = () => {
    return (
        <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Geography Vizo Map" subtitle="here we gonna display viz Map containing locations for current\previous Work both schedules or not ( filters ) -----------> on click popout for order details , we are also interested to show diffrene charts that may help\encourage the team ." />
          </Box>
        </Box>
    );
};

export default geography;