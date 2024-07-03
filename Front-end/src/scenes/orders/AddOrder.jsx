import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ref, push, onValue } from 'firebase/database';
import { db } from '../../firebase';
import Header from '../../components/Header';

const AddOrder = () => {
  const [orderPrivateNumber, setOrderPrivateNumber] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [employeeOfficeName, setEmployeeOfficeName] = useState('');
  const [employeeFieldName, setEmployeeFieldName] = useState('');
  const [describeOrder, setDescribeOrder] = useState('');
  const [customers, setCustomers] = useState([]);
  const [employeesOffice, setEmployeesOffice] = useState([]);
  const [employeesField, setEmployeesField] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = () => {
      const customersRef = ref(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList);
      });
    };

    const fetchEmployees = () => {
      const employeesRef = ref(db, 'users/');
      onValue(employeesRef, (snapshot) => {
        const data = snapshot.val();
        const employeeList = data ? Object.values(data) : [];
        setEmployeesOffice(employeeList.filter(emp => emp.userType === 'employee_office'));
        setEmployeesField(employeeList.filter(emp => emp.userType === 'field_worker'));
      });
    };

    fetchCustomers();
    fetchEmployees();
  }, []);

  const handleAddOrder = async () => {
    if (!orderPrivateNumber || !orderType || !orderDate || !customerName || !employeeOfficeName || !employeeFieldName || !describeOrder) {
      alert('Please fill in all fields.');
      return;
    }

    const newOrder = {
      orderPrivateNumber,
      orderType,
      orderDate,
      customerName,
      employeeOfficeName,
      employeeFieldName,
      describeOrder,
    };

    try {
      const ordersRef = ref(db, 'orders/');
      await push(ordersRef, newOrder);
      alert('Order added successfully!');
      navigate('/orders-info'); // Navigate to OrdersInfo page
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Error adding order. Please try again.');
    }
  };

  return (
    <Box m="20px">
      <Header title="Add Order" subtitle="Add a new order" />
      <Box display="flex" flexDirection="column" gap="20px" width="50%">
        <TextField
          label="Order Private Number"
          value={orderPrivateNumber}
          onChange={(e) => setOrderPrivateNumber(e.target.value)}
        />
        <TextField
          label="Order Type"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        />
        <TextField
          label="Order Date"
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth>
          <InputLabel>Customer Name</InputLabel>
          <Select
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          >
            {customers.map((customer, index) => (
              <MenuItem key={index} value={customer.name}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Employee Office Name</InputLabel>
          <Select
            value={employeeOfficeName}
            onChange={(e) => setEmployeeOfficeName(e.target.value)}
          >
            {employeesOffice.map((employee, index) => (
              <MenuItem key={index} value={employee.name}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Employee Field Name</InputLabel>
          <Select
            value={employeeFieldName}
            onChange={(e) => setEmployeeFieldName(e.target.value)}
          >
            {employeesField.map((employee, index) => (
              <MenuItem key={index} value={employee.name}>
                {employee.name}
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
        />
        <Button variant="contained" color="primary" onClick={handleAddOrder}>
          Add Order
        </Button>
      </Box>
    </Box>
  );
};

export default AddOrder;
