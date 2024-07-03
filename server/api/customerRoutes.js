const express = require('express');
const db = require('./firebaseConfig'); // Import Firebase configuration

const router = express.Router();

router.get('/getCustomer', async (req, res) => {
  try {
    console.log('Received request for /getCustomer');
    const customersRef = db.ref('customers');
    customersRef.once('value', (snapshot) => {
      const customerData = snapshot.val();
      console.log('Fetched customer data:', customerData);
      res.json(customerData);
    });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addCustomer', async (req, res) => {
  try {
    const { name, passportId, phone, email, password, confirmationPassword } = req.body;

    if (!name || !passportId || !phone || !email || !password || !confirmationPassword) {
      return res.status(400).json({
        status: "FAILED",
        message: "Required fields are missing"
      });
    }

    if (password !== confirmationPassword) {
      return res.status(400).json({
        status: "FAILED",
        message: "Passwords do not match"
      });
    }

    const customersRef = db.ref('customers');
    customersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
      if (snapshot.exists()) {
        return res.status(400).json({
          status: "FAILED",
          message: "Customer with this email already exists"
        });
      }

      customersRef.once('value', (snapshot) => {
        const customerCount = snapshot.numChildren() + 1;
        const newCustomerRef = customersRef.push();
        const newCustomer = {
          number: customerCount,
          name,
          passportId,
          phone,
          email,
          password,
          userType: 'customer' // Add the userType field here
        };
        newCustomerRef.set(newCustomer, (error) => {
          if (error) {
            console.error('Error adding customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
          }
          console.log('New customer added:', newCustomer);
          res.status(201).json(newCustomer);
        });
      });
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
