// backend/routes/auth.js

const express = require('express');
const nodemailer = require('nodemailer');
const { ref, update, getDatabase } = require('firebase/database');
const router = express.Router();
const db = getDatabase(); // Firebase Realtime Database instance

// Nodemailer setup (use your own SMTP server credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any email service provider you use
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Helper function to generate a 5-digit random code
const generateCode = () => Math.floor(10000 + Math.random() * 90000);

router.post('/send-reset-code', async (req, res) => {
  const { email } = req.body;

  // Generate a 5-digit confirmation code
  const resetCode = generateCode();

  // Update Firebase with the generated code
  const usersRef = ref(db, 'users');
  usersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Assuming the email exists, update the user with the reset code
    const userId = Object.keys(snapshot.val())[0];
    const userRef = ref(db, `users/${userId}`);

    update(userRef, { resetCode }).then(() => {
      // Send an email with the confirmation code
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email' });
        }

        res.status(200).json({ message: 'Reset code sent successfully' });
      });
    });
  });
});

module.exports = router;
