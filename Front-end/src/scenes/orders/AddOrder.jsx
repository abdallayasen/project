// src/scenes/orders/AddOrder.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete
} from '@mui/material';
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

const AddOrder = ({ onClose }) => {
  const [orderType, setOrderType] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [describeOrder, setDescribeOrder] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [x, setX] = useState('');  // New state for x-coordinate
  const [y, setY] = useState('');  // New state for y-coordinate
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
        setFilteredEmails(customerList.map(customer => customer.email)); // Populate initial emails
      });
    };

    fetchCustomers();
  }, []);

 // Update the handleAddOrder function to include x and y coordinates
const handleAddOrder = async () => {
  // Validation: Ensure all fields are filled
  if (!orderType || !orderDate || !customerEmail || !describeOrder || !x || !y) {
    alert('Please fill in all fields.');
    return; // Stop the execution if validation fails
  }
    
    const orderPrivateNumber = await generateUniqueOrderPrivateNumber();
  
    const newOrder = {
      orderPrivateNumber,
      orderType,
      orderDate,
      customerEmail,
      describeOrder,
      employeeOfficeName: '', // This will be filled by the office employee later
      x: parseFloat(x),  // Store x as float
      y: parseFloat(y),  // Store y as float
    };
  
    try {
      const ordersRef = ref(db, 'orders/');
      await push(ordersRef, newOrder);
      alert('Order added successfully!');
      onClose();  // Close the dialog
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Error adding order. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
    navigate('/manager/orders');  // Navigate to a valid page (replace with your route)
  };

  // Filter email suggestions based on input
  const handleEmailInputChange = (event, value) => {
    if (value) {
      const filtered = customers
        .map((customer) => customer.email)
        .filter((email) => email.toLowerCase().includes(value.toLowerCase()));
      setFilteredEmails(filtered);
    }
  };

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: colors.primary[400], backgroundColor: colors.greenAccent[600],textAlign: 'center' , fontSize: '24px'  }}>
        Add New Order
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], padding: '20px' }}>
        <Box display="flex" flexDirection="column" gap="20px">
          <TextField
            label="Order Type"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
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
          <Autocomplete
            freeSolo
            options={filteredEmails}
            onInputChange={handleEmailInputChange}
            onChange={(e, value) => setCustomerEmail(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer Email"
                InputLabelProps={{
                  style: { color: colors.grey[100] }, // Input label color
                }}
                InputProps={{
                  ...params.InputProps,
                  style: { color: colors.grey[100] }, // Text color
                }}
              />
            )}
          />

          <TextField
            label="X Coordinate"
            value={x}
            onChange={(e) => setX(e.target.value)}
            fullWidth
            InputLabelProps={{
              style: { color: colors.grey[100] }, // Input label color
            }}
            InputProps={{
              style: { color: colors.grey[100] }, // Text color
            }}
          />
          <TextField
            label="Y Coordinate"
            value={y}
            onChange={(e) => setY(e.target.value)}
            fullWidth
            InputLabelProps={{
              style: { color: colors.grey[100] }, // Input label color
            }}
            InputProps={{
              style: { color: colors.grey[100] }, // Text color
            }}
          />
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
        <Button onClick={handleAddOrder} sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100] }}>
          Add Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrder;
