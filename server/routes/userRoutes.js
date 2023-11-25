const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { createSecretToken } = require("../utils/SecretToken");

router.post(
  '/signup',
  [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    check('username').notEmpty().withMessage('Username is required')
  ],
  async (req, res , next) => {
    
    // const errors = validationResult(req);
    
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    console.log("req for signup")
    const { email, password, username, profession, expertise , confirmPassword } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
      }
 
      user = new User({
        email,
        password,
        username , 
        profession , 
        expertise , 
        confirmPassword
      });
      console.log("got user")
      await user.save();
      console.log("saved user")
     res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
      next();
    } catch (error) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// POST route for user login
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res , next) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("validationResult Error")
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      
      const accessToken = generateAccessToken ({user: user})
      const refreshToken = generateRefreshToken ({user: user})
      res.json ({accessToken: accessToken, refreshToken: refreshToken})

      // const token = createSecretToken(user._id);
      // res.cookie("token", token, {
      //   credentials: 'include',
      //   httpOnly: false,
      // });
      // res.status(201).json({ message: "User logged in successfully", success: true });
      // next()
    } catch (error) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

router.get('/search', async (req, res) => {
  const { profession, expertise, username } = req.query;
  const query = {};

  if (!profession && !expertise && !username) {
      return res.json({ message: 'You have not searched anything' });
  }

  if (profession) {
      query.profession = { $regex: new RegExp(profession, 'i') };
  }

  if (expertise) {
      query.expertise = { $regex: new RegExp(expertise, 'i') };
  }

  if (username) {
      query.username = { $regex: new RegExp(username, 'i') };
  }

  try {
      // Search for users based on the query
      const users = await User.find(query, 'username profession expertise');

      if (users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
      }

      // Return the user data based on the search criteria
      res.json({ users });
  } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});


router.get('/byId/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});
  

router.get('/byName/:userName', async (req, res) => {
  const userName = req.params.userName;
  try {
    const user = await User.find({username : userName});
    if (!user || user.length == 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = await user[0]._id;
    res.json({ userName, userId});
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
})
  // accessTokens
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "700m"}) 
}

// refreshTokens
let refreshTokens = []

function generateRefreshToken(user) {
  const refreshToken = 
  jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "900m"})
  refreshTokens.push(refreshToken)
  return refreshToken
}

//REFRESH TOKEN API
router.post("/refreshToken", (req,res) => {
  if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
  refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
  //remove the old refreshToken from the refreshTokens list
  const accessToken = generateAccessToken ({user: req.body.name})
  const refreshToken = generateRefreshToken ({user: req.body.name})
  //generate new accessToken and refreshTokens
  res.json ({accessToken: accessToken, refreshToken: refreshToken})
  })

router.delete("/logout", (req,res)=>{
  refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
  //remove the old refreshToken from the refreshTokens list
  res.status(204).send("Logged out!")
  })





module.exports = router;