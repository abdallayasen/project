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
  const [customers, setCustomers] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    // Fetch orders
    const ordersRef = ref(db, 'orders/');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const ordersList = data ? Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        client_mail: data[key].customerEmail, // Add client_mail field
      })) : [];
      setOrders(ordersList);
    });

    // Fetch customers
    const customersRef = ref(db, 'customers/');
    onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      const customerList = data ? Object.values(data) : [];
      setCustomers(customerList);
    });
  }, []);

  // Join orders with customers to get client_id (passportId)
  const ordersWithCustomerNames = orders.map(order => {
    const customer = customers.find(cust => cust.email === order.customerEmail);
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer',
      client_id: customer ? customer.passportId : 'Unknown ID', // Use passportId as client_id
    };
  });

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
      field: 'client_id',
      headerName: 'Client ID',
      flex: 1, // Display client_id from passportId
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
      field: 'x',
      headerName: 'X Coordinate',
      flex: 1,
    },
    {
      field: 'y',
      headerName: 'Y Coordinate',
      flex: 1,
    }
,    
    {
      field: 'describeOrder',
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
          rows={ordersWithCustomerNames}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default OrdersInfo;
