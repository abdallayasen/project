import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, useTheme, Box } from '@mui/material';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { tokens } from '../../theme';

const ForgotPasswordPopup = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false); // Track if email has been sent
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const auth = getAuth();

  const handleSendResetEmail = () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    // Send the password reset email via Firebase
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage(`Password reset email sent to ${email}`);
        setEmailSent(true); // Mark that email has been sent
        setError('');
      })
      .catch(() => {
        setError('Error sending reset email. Make sure the email is correct.');
        setMessage('');
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '450px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" align="center" style={{ color: '#fff', fontWeight: 'bold' }}>
          Forgot Password
        </Typography>
      </DialogTitle>
      <DialogContent dividers={false} sx={{ paddingBottom: '20px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {!emailSent ? (
            <>
              <Typography
                variant="body1"
                align="center"
                sx={{
                  color: colors.grey[300],
                  marginBottom: '20px',
                }}
              >
                Enter your email below, and we will send you a link to reset your password.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  style: {
                    backgroundColor: 'transparent', // Transparent input background
                    color: '#fff',                   // White input text color
                  },
                  disableUnderline: true,             // Disable underline for a cleaner look
                }}
                InputLabelProps={{
                  shrink: email !== '',  // Only shrink when there is input
                  style: {
                    color: 'rgba(255, 255, 255, 0.6)',  // Transparent label
                    transition: 'all 0.3s ease',  // Smooth transition for label
                    marginLeft: '5px', // Move the label to the right
                    marginTop :'5px'
                  },
                }}
                sx={{
                  '& .MuiInputLabel-root.Mui-focused': {
                    display: 'none',  // Hide the label when input is focused
                  },
                  marginBottom: '20px',
                }}
              />
            </>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              sx={{
                color: colors.grey[300],
                marginBottom: '20px',
              }}
            >
              {message}
            </Typography>
          )}

          {error && <Typography color="red" align="center">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#e57373',
            color: 'white',
            borderRadius: '20px',
            padding: '10px 20px',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#ef5350',
            },
          }}
        >
          Close
        </Button>
        {!emailSent && (
          <Button
            onClick={handleSendResetEmail}
            sx={{
              backgroundColor: '#81c784',
              color: 'white',
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#66bb6a',
              },
            }}
          >
            Send Reset Email
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordPopup;
