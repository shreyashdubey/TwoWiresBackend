// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const EmailSubSchema = require("../models/EmailSubSchema");

// Function to validate email using a simple regular expression
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

     // Check if the email is valid
     if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the email already exists
    const existingEmail = await EmailSubSchema.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Save the email to the database
    const newEmailSub = new EmailSubSchema({ email });
    await newEmailSub.save();

    return res.status(201).json({ message: "Email subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
