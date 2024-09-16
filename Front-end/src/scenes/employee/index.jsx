import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database'; // Import 'update' to handle Firebase updates
import { db } from '../../firebase';
import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Load employee data from Firebase
  useEffect(() => {
    const usersRef = ref(db, 'users/');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const employeeList = data
        ? Object.keys(data).map((key, index) => ({
            id: key, // Use Firebase key as id to ensure unique identification
            serialNumber: index + 1,
            ...data[key],
          }))
        : [];
      setEmployees(employeeList.filter((employee) => employee.userType !== 'customer'));
    });
  }, []);

  // Handle updating the end date in Firebase
  const handleCellEditCommit = async (params) => {
    const { id, field, value } = params;

    if (field === 'endDate') {
      try {
        const employeeRef = ref(db, `users/${id}`);
        await update(employeeRef, { endDate: value }); // Update the 'endDate' in Firebase
        console.log(`Updated endDate for employee with ID: ${id}`);
      } catch (error) {
        console.error('Error updating endDate:', error);
      }
    }
  };

  const columns = [
    { field: 'serialNumber', headerName: 'Serial Number', flex: 0.5 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'passportId',
      headerName: 'Passport ID',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone Number',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      editable: true, // Make 'endDate' editable
      type: 'date', // Set column type to 'date'
      valueGetter: (params) => (params.value ? new Date(params.value) : null), // Convert string to Date object
      valueSetter: (params) => {
        const newValue = params.value ? new Date(params.value).toISOString().split('T')[0] : null; // Handle null or empty values
        return { ...params.row, endDate: newValue };
      },
    },
    {
      field: 'userType',
      headerName: 'Role',
      flex: 1,
    },
  ];

  return (
<Box 
    m="20px" 
   
  >      <Header title="Employee Information" subtitle="Employee information details" />
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
          '& .name-column--cell': {
            color: colors.greenAccent[300],
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={employees}
          columns={columns}
          processRowUpdate={handleCellEditCommit} // Handle the editing of rows
          slots={{ toolbar: GridToolbar }}
          experimentalFeatures={{ newEditingApi: true }} // Enable new editing API
        />
      </Box>
    </Box>
  );
};

export default Employee;
