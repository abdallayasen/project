const express = require('express');
const db = require('./firebaseConfig'); // Import the Firebase database instance

const router = express.Router();

router.get('/getUser', async (req, res) => {
  try {
    const usersRef = db.ref('users');
    usersRef.once('value', (snapshot) => {
      const usersData = snapshot.val();
      res.json(usersData);
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addUser', async (req, res) => {
  try {
    const { email, password, userType, name, passportID, phone, address, city, startDate, endDate } = req.body;

    if (!email || !password || !userType || !name || !passportID || !phone || !address || !city || !startDate || !endDate) {
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
      newUserRef.set({ email, password, userType, name, passportID, phone, address, city, startDate, endDate }, (error) => {
        if (error) {
          console.error('Error adding user:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ id: newUserRef.key, email, password, userType, name, passportID, phone, address, city, startDate, endDate });
      });
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "FAILED",
        message: "Required fields are missing"
      });
    }

    const usersRef = db.ref('users');
    usersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
      if (!snapshot.exists()) {
        return res.status(400).json({
          status: "FAILED",
          message: "Invalid email or password"
        });
      }

      const userData = snapshot.val();
      const userId = Object.keys(userData)[0];
      const user = userData[userId];

      if (user.password !== password) {
        return res.status(400).json({
          status: "FAILED",
          message: "Invalid email or password"
        });
      }

      res.status(200).json({ userType: user.userType });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
