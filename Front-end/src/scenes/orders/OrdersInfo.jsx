import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';

const OrdersInfo = () => {
  const [orders, setOrders] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const ordersRef = ref(db, 'orders/');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const ordersList = data ? Object.keys(data).map((key, index) => ({ id: index + 1, ...data[key] })) : [];
      setOrders(ordersList);
    });
  }, []);

  const columns = [
    { field: 'id', headerName: 'Order Number', flex: 0.5 },
    {
      field: 'orderPrivateNumber',
      headerName: 'Order Private Number',
      flex: 1,
    },
    {
      field: 'orderType',
      headerName: 'Order Type',
      flex: 1,
    },
    {
      field: 'orderDate',
      headerName: 'Order Date',
      flex: 1,
    },
    {
      field: 'customerName',
      headerName: 'Customer Name',
      flex: 1,
    },
    {
      field: 'employeeOfficeName',
      headerName: 'Employee Office Name',
      flex: 1,
    },
    {
      field: 'employeeFieldName',
      headerName: 'Employee Field Name',
      flex: 1,
    },
    {
      field: 'orderDescription',
      headerName: 'Order Description',
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header title="Orders Information" subtitle="Details of all orders" />
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
          rows={orders}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default OrdersInfo;
