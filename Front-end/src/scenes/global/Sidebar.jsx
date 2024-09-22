// src/components/global/Sidebar.jsx
import React, { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Dialog, DialogContent } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import WorkIcon from "@mui/icons-material/Work";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import PreviewIcon from "@mui/icons-material/Preview";
import AddIcon from "@mui/icons-material/Add";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { UserContext } from '../../context/UserContext'; 
import UserImage from '../../Assets/Icons/user2.png'; 
import SignUp from '../../components/LoginPage/SignUp'; 
import AddOrder from '../../scenes/orders/AddOrder';  // Import AddOrder component

const Item = ({ title, to, icon, selected, setSelected, onClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => {
        setSelected(title);
        if (onClick) onClick();
      }}
      icon={icon}
    >
      <Typography variant="h6">
        {title}
      </Typography>
      {to && <Link to={to} />}
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [isSignUpOpen, setSignUpOpen] = useState(false); 
  const [isAddOrderOpen, setAddOrderOpen] = useState(false);  // State for Add Order pop-up
  const { user } = useContext(UserContext); 
  const iconColor = colors.grey[100]; // or any color you prefer

  const openSignUp = () => {
    setSignUpOpen(true);
  };

  const closeSignUp = () => {
    setSignUpOpen(false);
  };

  const openAddOrder = () => {
    setAddOrderOpen(true);
  };

  const closeAddOrder = () => {
    setAddOrderOpen(false);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundRepeat: 'no-repeat',            // Prevent repeating the image
        backgroundPosition: 'center',             // Center the background image
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        // "& .pro-inner-item": {
        //   padding: "5px 35px 5px 20px !important",
        // },
        // '&.active, &:focus, &:hover': {
        //   backgroundColor: 'transparent',  // Prevent gray background on click
        //   color: colors.grey[100],         // Ensure text color remains the same
        // },
        // "& .pro-sidebar": {
        //   boxShadow: "none !important",  // Remove any box shadow
        // },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
  
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h4" color={colors.grey[100]} >
                  GraphMap
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={UserImage}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1)}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {user?.name}
                </Typography>
              </Box>
            </Box>
          )}

<Box paddingLeft={isCollapsed ? undefined : "10%"}>
<MenuItem
  icon={<HomeOutlinedIcon/>}  // Set the correct icon color
  style={{ color: colors.grey[100] }}  // Ensure the text color is consistent with others
>
  <Typography variant="h5" sx={{ color: colors.grey[100] }}>
    Home
  </Typography>
  <Link to="/manager/dashboard" />
</MenuItem>


            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Manage
            </Typography>
            
    <Item
  title={user?.userType === 'manager' ? "Order Confirmation" : "My Works"}  // Conditional title
  to="/manager/mywork"
  icon={<WorkIcon sx={{ color: iconColor }} />}
  selected={selected}
  setSelected={setSelected}
/>

            <Item
              title="Work Management"
              to="/manager/work"
              icon={<PreviewIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="All Work"
              to="/manager/allwork"
              icon={<WorkHistoryIcon/>}
              selected={selected}
              setSelected={setSelected}
            />

           
            {user?.userType === 'manager' && (
              
              <>
               <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Information
            </Typography>
                <Item
                  title="Employee Info"
                  to="/manager/employee"
                  icon={<PeopleOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Clients Info"
                  to="/manager/customer"
                  icon={<ContactsOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            )}

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Geography Chart"
              to="/manager/geography"
              icon={<MapOutlinedIcon/>}
              selected={selected}
              setSelected={setSelected}
            />

          


           
            {user?.userType === 'manager' && (
              <>
               <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Add
            </Typography>
                <MenuItem
                  icon={<AddIcon />}
                  onClick={openAddOrder}  // Open Add Order pop-up
                  style={{ color: colors.grey[100] }}
                >
                  <Typography variant="h6" >
                    Add Order
                  </Typography>
                </MenuItem>

                <MenuItem
                  icon={<AddIcon />}
                  onClick={openSignUp}  // Open Sign Up pop-up
                  style={{ color: colors.grey[100] }}
                >
                  <Typography variant="h6">
                    Sign Up
                  </Typography>
                </MenuItem>
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>

      {/* SignUp Pop-up Dialog */}
      <Dialog open={isSignUpOpen} onClose={closeSignUp} maxWidth="sm" fullWidth>
        <DialogContent>
          <SignUp open={isSignUpOpen} onClose={closeSignUp} /> 
        </DialogContent>
      </Dialog>

      {/* AddOrder Pop-up Dialog */}
      <Dialog open={isAddOrderOpen} onClose={closeAddOrder} maxWidth="md" fullWidth>
        <DialogContent>
          <AddOrder onClose={closeAddOrder} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
