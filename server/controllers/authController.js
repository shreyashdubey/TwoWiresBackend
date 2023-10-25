const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const oauth2Client = require('../utils/oauth2client')
const User = require('../models/UserSchema');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT,
    });
};
// Create and send Cookie ->
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    user.password = undefined;

    res.cookie("token", token, {
        credentials: 'include',
       httpOnly: false,
    })

    res.status(statusCode).json({
        message: 'success',
        token,
        data: {
            user,
        },
    });
};
/* GET Google Authentication API. */
exports.googleAuth = catchAsync(async (req, res, next) => {
    const code = req.query.code;
    const googleRes = await oauth2Client.oauth2Client.getToken(code);
    oauth2Client.oauth2Client.setCredentials(googleRes.tokens);
   
    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
     let user = await User.findOne({ email: userRes.data.email });
     
    if (!user) {
        console.log('New User found');
        user = await User.create({
            username: userRes.data.name,
            email: userRes.data.email,
       
        });
    }
    createSendToken(user, 201, res);
});
