import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, MenuItem, Select } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';  // Assuming tokens are defined in your theme

// Import Firebase Database Functions
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';

const AddCustomer = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);  // Get the colors based on the theme mode

  const auth = getAuth();

  const handleUserTypeChange = (e) => {
    const selectedUserType = e.target.value;
    setUserType(selectedUserType);
   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
 
    if((userType === 'customer')){
    if (!email || !userType || !name || !passportId || !phone) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    

    try {
      // Check if the name already exists
      const db = getDatabase();
      const usersRef = ref(db, userType === 'customer' ? 'customers' : 'users');
      const nameQuery = query(usersRef, orderByChild('name'), equalTo(name));
      const nameSnapshot = await get(nameQuery);

      if (nameSnapshot.exists()) {
        setErrorMessage('This name is already in use. Please choose a different name.');
        return;
      }

      // **Define userData Using Ternary Operator**
    const userData =  {
      name,
      passportId,
      phone,
      email,
      userType,
    };
      if (userType === 'customer') {
        await axios.post('http://localhost:8000/addCustomer', userData);
        alert('Customer successfully added!');
      } 

      // Reset form and close the modal
      setName('');
      setPassportId('');
      setPhone('');
      setEmail('');
      setUserType('');
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Error adding :', error);
    
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already in use. Please use a different email address.');
      } else if (error.response && error.response.data && error.response.data.message) {
        // If backend sends a message field
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error adding user. Please try again.');
      }
    }
    
    
    
  };

  return (
    <>
<DialogTitle sx={{ backgroundColor: colors.greenAccent[600], textAlign: 'center', fontSize: '24px' }}>
          Add Customer
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }} dividers>
        {errorMessage && <Typography color="error" align="center">{errorMessage}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Passport ID"
            variant="outlined"
            fullWidth
            value={passportId}
            onChange={(e) => setPassportId(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
           <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <Select
            label="User Type"
            value={userType}
            onChange={handleUserTypeChange}
            fullWidth
            required
            sx={{ mb: 2, color: colors.grey[100] }}
            displayEmpty
          >
            <MenuItem value="" disabled>Select  Type</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
          </Select>
         
        </form>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
        <Button onClick={onClose} sx={{ backgroundColor: colors.redAccent[500], color: colors.grey[100] }}>
          Close
        </Button>
        <Button onClick={handleSubmit} sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}>
          Add Customer
        </Button>
      </DialogActions>
      </>
  );
};

export default AddCustomer;
