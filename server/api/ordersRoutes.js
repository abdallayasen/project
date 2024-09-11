const express = require('express');
const db = require('./firebaseConfig'); // Import Firebase configuration

const router = express.Router();

router.post('/addOrder', async (req, res) => {
  try {
    const { orderPrivateNumber, orderType, orderDate, customerEmail, employeeOfficeName, employeeFieldName, describeOrder } = req.body;

    if (!orderPrivateNumber || !orderType || !orderDate || !customerEmail || !employeeOfficeName || !employeeFieldName || !describeOrder) {
      return res.status(400).json({
        status: "FAILED",
        message: "Required fields are missing"
      });
    }

    const ordersRef = db.ref('orders');
    const newOrderRef = ordersRef.push();
    const newOrder = {
      orderPrivateNumber,
      orderType,
      orderDate,
      customerEmail, // Save customer email for future joins
      employeeOfficeName,
      employeeFieldName,
      describeOrder
    };

    newOrderRef.set(newOrder, (error) => {
      if (error) {
        console.error('Error adding order:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('New order added:', newOrder);
      res.status(201).json(newOrder);
    });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
