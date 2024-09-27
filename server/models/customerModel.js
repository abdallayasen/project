// Import required packages
const mongoose = require('mongoose');

// Define the schema for the user data using Mongoose
const customerSchema = new mongoose.Schema({
  number: Number,
  name: String,
  phone: String,
  passportId: Number,
  email: String,
});

// Create a Mongoose model called "customerModel" based on the userSchema
const customerModel = mongoose.model('customers', customerSchema);

module.exports = customerModel;
