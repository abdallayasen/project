// backend/api/userRoutes.js
const express = require('express');
const db = require('./firebaseConfig'); // Import the Firebase database instance

const router = express.Router();

router.post('/addUser', async (req, res) => {
  try {
    const { name, passportId, phone, email, userType, address, city, startDate, endDate } = req.body;

    if (!email || !userType || !name || !passportId || !phone) {
      return res.status(400).json({
        status: "FAILED",
        message: "Required fields are missing"
      });
    }

    const usersRef = db.ref('users');
    usersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
      if (snapshot.exists()) {
        return res.status(400).json({
          status: "FAILED",
          message: "User with this email already exists"
        });
      }

      const newUserRef = usersRef.push();
      newUserRef.set({
        name,
        passportId,
        phone,
        email,
        userType,
        address,
        city,
        startDate,
        endDate
      }, (error) => {
        if (error) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ id: newUserRef.key, email, userType });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
