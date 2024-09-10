import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ref, push, onValue, get } from 'firebase/database';
import { db } from '../../firebase';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

const generateRandomNumber = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit number
};

const checkOrderPrivateNumberExists = async (orderPrivateNumber) => {
  const ordersRef = ref(db, 'orders/');
  const snapshot = await get(ordersRef);
  const orders = snapshot.val();
  return Object.values(orders || {}).some(order => order.orderPrivateNumber === orderPrivateNumber);
};

const generateUniqueOrderPrivateNumber = async () => {
  let orderPrivateNumber;
  let exists = true;
  
  while (exists) {
    orderPrivateNumber = generateRandomNumber();
    exists = await checkOrderPrivateNumberExists(orderPrivateNumber);
  }

  return orderPrivateNumber;
};

const AddOrder = () => {
  const [orderType, setOrderType] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [describeOrder, setDescribeOrder] = useState('');
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(true); // Control the Dialog visibility
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchCustomers = () => {
      const customersRef = ref(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList);
      });
    };

    fetchCustomers();
  }, []);

  const handleAddOrder = async () => {
    if (!orderType || !orderDate || !customerEmail || !describeOrder) {
      alert('Please fill in all fields.');
      return;
    }
  
    const orderPrivateNumber = await generateUniqueOrderPrivateNumber();
  
    const newOrder = {
      orderPrivateNumber,
      orderType,
      orderDate,
      customerEmail,
      describeOrder,
      employeeOfficeName: '', // This will be filled by the office employee later
    };
  
    try {
      const ordersRef = ref(db, 'orders/');
      await push(ordersRef, newOrder);
      alert('Order added successfully!');
      navigate('/dashboard'); // Redirect to home (dashboard) page
      setOpen(false); // Close the dialog after successful submission
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Error adding order. Please try again.');
    }
  };
  

  const handleClose = () => {
    setOpen(false);
    navigate('/orders-info'); // Redirect to orders page if dialog is closed
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
        Add New Order
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], padding: '20px' }}>
        <Box display="flex" flexDirection="column" gap="20px">
          <TextField
            label="Order Type"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            fullWidth
            InputLabelProps={{
              style: { color: colors.grey[100] }, // Input label color
            }}
            InputProps={{
              style: { color: colors.grey[100] }, // Text color
            }}
          />
          <TextField
            label="Order Date"
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <FormControl fullWidth>
            <InputLabel style={{ color: colors.grey[100] }}>Customer Email</InputLabel>
            <Select
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              fullWidth
              style={{ color: colors.grey[100] }}
            >
              {customers.map((customer, index) => (
                <MenuItem key={index} value={customer.email}>
                  {customer.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Order Description"
            value={describeOrder}
            onChange={(e) => setDescribeOrder(e.target.value)}
            multiline
            rows={4}
            fullWidth
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
        <Button onClick={handleClose} sx={{ backgroundColor: colors.redAccent[500], color: colors.grey[100] }}>
          Cancel
        </Button>
        <Button onClick={handleAddOrder} sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}>
          Add Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrder;
