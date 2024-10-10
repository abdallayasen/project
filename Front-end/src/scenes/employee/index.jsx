import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../firebase';
import { Box, TextField, IconButton, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Import calendar icon
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';     // Or from the appropriate package

// DatePickerCell Component for handling the date picker logic
const DatePickerCell = ({ id, value, field, api }) => {
  const [openPicker, setOpenPicker] = useState(false);
  const [dateValue, setDateValue] = useState(value ? new Date(value) : null);

  const handleDateChange = (newDate) => {
    setDateValue(newDate);
    api.setEditCellValue({ id, field, value: newDate ? newDate.toISOString().split('T')[0] : null });
    api.stopCellEditMode({ id, field }); // Stop edit mode after selecting a date
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" alignItems="center">
        <TextField
          value={dateValue ? dateValue.toISOString().split('T')[0] : ''}
          fullWidth
          onClick={() => setOpenPicker(true)} // Open date picker when input is clicked
          InputProps={{
            style: {
              color: dateValue ? 'inherit' : 'rgba(0, 0, 0, 0.5)', // Lighter color for the placeholder
              fontStyle: !dateValue ? 'italic' : 'normal', // Italic font if there's no date
            },
            endAdornment: (
              <IconButton onClick={() => setOpenPicker(true)}>
                <CalendarTodayIcon />
              </IconButton>
            ),
          }}
        />
        <DatePicker
          label="End Date"
          value={dateValue}
          onChange={handleDateChange}
          open={openPicker}
          onClose={() => setOpenPicker(false)} // Close date picker when selection is made
          renderInput={(params) => null} // Hide the default input box since we use our custom input
        />
      </Box>
    </LocalizationProvider>
  );
};

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [blockedEmployees, setBlockedEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openUnblockDialog, setOpenUnblockDialog] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    const usersRef = ref(db, 'users/');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const employeeList = data
        ? Object.keys(data).map((key, index) => ({
            id: key,
            serialNumber: index + 1,
            ...data[key],
          }))
        : [];
      setEmployees(employeeList.filter((employee) => employee.userType !== 'customer'));
    });
  }, []);

  const handleRowUpdate = async (newRow) => {
    const { id, endDate } = newRow;
    const employeeRef = ref(db, `users/${id}`);
    try {
      await update(employeeRef, { endDate }); // Update Firebase with new end date
      return newRow; // Return updated row
    } catch (error) {
      console.error('Error updating endDate:', error);
    }
  };

  const handleBlockEmployees = async () => {
    const currentDate = new Date();
    for (const employee of selectedEmployees) {
      const endDate = new Date(employee.endDate);  // Convert string to Date object
      if (!employee.endDate || endDate > currentDate) {
        alert(`Cannot block ${employee.name}, end date is not yet passed.`);
        return;
      }
      try {
        await update(ref(db, `users/${employee.id}`), { blocked: true });
        alert(`${employee.name} has been blocked from logging in.`);
      } catch (error) {
        console.error('Error blocking employee:', error);
      }
    }
  };








  const handleOpenUnblockDialog = () => {
    const blocked = employees.filter((employee) => employee.blocked); // Filter blocked employees
    setBlockedEmployees(blocked); // Set the blocked employees in state
    setOpenUnblockDialog(true); // Open the unblock dialog
  };
  

  const handleCloseUnblockDialog = () => {
    setOpenUnblockDialog(false);
  };
  const handleUnblockEmployee = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee to unblock.");
      return;
    }
  
    for (const employee of selectedEmployees) {
      try {
        await update(ref(db, `users/${employee.id}`), { blocked: false, endDate: null });
        alert(`${employee.name} (${employee.passportId}) has been unblocked and can log in again.`);
      } catch (error) {
        console.error(`Error unblocking ${employee.name}:`, error);
      }
    }
  
    // Close dialog and reset states after unblocking
    setOpenUnblockDialog(false);
    setSelectedEmployees([]);  // Clear selected employees after action
  };
  
  const handleSelectUser = (event) => {
    setSelectedUserId(event.target.value);
  };
  const columns = [
    {
      field: 'select',
      headerName: 'Select',
      flex: 0.5,
      renderCell: (params) => {
        if (params.row.blocked) {
          return (
            <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 0, 0, 0.2)" // Light red background
            borderRadius="8px" // Rounded corners
            p={1} // Padding
            height="100%" // Full height of the cell
          >

            <Typography variant="body2" color="red" fontStyle="italic">
               blocked
            </Typography>
            </Box>

          );
        }
        return (
          <Checkbox
            checked={selectedEmployees.some(emp => emp.id === params.row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedEmployees([...selectedEmployees, params.row]);
              } else {
                setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== params.row.id));
              }
            }}
          />
        );
      },
    },

    { field: 'serialNumber', headerName: 'Serial Number', flex: 0.5 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'passportId', headerName: 'Passport ID', flex: 1 },
    { field: 'phone', headerName: 'Phone Number', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'city', headerName: 'City', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      editable: true,
      renderEditCell: (params) => <DatePickerCell {...params} />, // Use DatePickerCell component
    },
    { field: 'userType', headerName: 'Role', flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header title="Employee Information" subtitle="Employee information details" />
      {/* Note to inform users they can double-click to edit the end date */}
      <Typography variant="body2" color="#0db9f5" sx={{ mb: 1, fontSize: '20px' }}>
        Note:You can edit the End Date. Please double-click on the field to update.
      </Typography>
      <Box
      
  m="40px 0 0 0"
  height="75vh"
  sx={{
    '& .MuiDataGrid-root': {
      border: 'none',
    },
    '& .MuiDataGrid-cell': {
      borderBottom: 'none',
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: colors.blueAccent[700],
      borderBottom: 'none',
      color: theme.palette.mode === 'dark' ? 'white' : 'black', // Change text color based on theme
    },
    '& .MuiDataGrid-virtualScroller': {
      backgroundColor: colors.primary[400],
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: 'none',
      backgroundColor: colors.blueAccent[700],
      color: theme.palette.mode === 'dark' ? 'white' : 'black', // Change footer text color based on theme
    },
    '& .MuiButtonBase-root': {
      color: theme.palette.mode === 'dark' ? 'white' : 'black', // Change buttons and toolbar icons color
    },
    '& .blocked-row': {
      boxShadow: '0 8px 16px rgba(255, 255, 255, 1)',  // Stronger and clearer white shadow for blocked employees
    },
  }}
>
<Button
  variant="contained"
  color= "error"
  onClick={handleBlockEmployees}
  disabled={selectedEmployees.length === 0}  // Disable if no employees are selected

  sx={{ mt: 2, color: 'black !important' }}  // Force text to always be white
>
  Block Selected Employee
</Button>

<Button
          variant="contained"
          color="secondary" // You can choose a different color for unblocking
          onClick={handleOpenUnblockDialog}

          sx={{ mt: 2, ml: 2, color: 'black !important' }}
        >
          Unblock Selected Employee
        </Button>

  <DataGrid
    rows={employees}
    columns={columns}
    processRowUpdate={handleRowUpdate} // Handle row updates
    slots={{ toolbar: GridToolbar }}
    getRowClassName={(params) => (params.row.blocked ? 'blocked-row' : '')} // Add this line
    experimentalFeatures={{ newEditingApi: true }} // Enable new editing API
  />
</Box>
  {/* Unblock Dialog */}
  <Dialog open={openUnblockDialog} onClose={handleCloseUnblockDialog}>
  <DialogTitle>Select Users to Unblock</DialogTitle>
  <DialogContent>
    <Box>
      {blockedEmployees.map((employee) => (
        <Box key={employee.id} display="flex" alignItems="center">
          <Checkbox
            value={employee.id}
            checked={selectedEmployees.some(emp => emp.id === employee.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedEmployees([...selectedEmployees, employee]);
              } else {
                setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employee.id));
              }
            }}
          />
          <Typography variant="body1">
            {employee.name} ({employee.passportId}) {/* Display name and passportId */}
          </Typography>
        </Box>
      ))}
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseUnblockDialog}>Cancel</Button>
    <Button onClick={handleUnblockEmployee} color="primary">Unblock</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Employee;
