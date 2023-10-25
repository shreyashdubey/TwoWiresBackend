const express = require('express');
const cookieParser = require("cookie-parser")
const authController = require('../controllers/authController');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/UserSchema");

const Router = express.Router();
Router.get("/google", authController.googleAuth);

Router.post('/middleware',  (req, res) => {
    const token = req.cookies.token
    if (!token) {
      return res.json({ status: false })
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
      if (err) {
       return res.json({ status: false })
      } else {
        const user = await User.findById(data.id)
        if (user) return res.json({ status: true, user: user })
        else return res.json({ status: false })
      }
    })
  } );


module.exports = Router;
