const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const Education = require('../models/EducationSchema');
const Experience = require('../models/ExperienceSchema');
const Skill = require('../models/SkillSchema');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { createSecretToken } = require("../utils/SecretToken");
const otpGenerator = require('otp-generator')
const OneSignal = require('@onesignal/node-onesignal');

const ONE_SIGNAL_APP_ID = '12fedbe1-46f0-44fb-893a-b765cbabf575';
const ONE_SIGNAL_API_KEY = 'ZDE2YzZlMTQtZGI1Mi00NWI2LWFhNmYtZDM5YjQ0MWJmZTY1';
let otp = 0 ;

function generateOTP() {
  // Your OTP generation logic here
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email , username) {
  try {
     otp = generateOTP();

    // OneSignal API client setup
    const configuration = OneSignal.createConfiguration({
      appKey: ONE_SIGNAL_API_KEY,
    });
    const client = new OneSignal.DefaultApi(configuration);

    // Customize your email message here
    const emailMessage = `
      Hey {{ message.custom_data.user.first_name | default: "there" }},
      To join, verify your email with the One Time Password: 
      ${otp}
    `;

    // Send verification email using OneSignal
    const response = await client.createNotification({
      app_id: ONE_SIGNAL_APP_ID,
      include_email_tokens: [email], // Send to a specific email
      template_id: '4b534ecd-4b56-4c43-a411-0f3cf85c2a0c', // Replace with your actual template ID
      custom_data: {
        user: {
          first_name: username, // Replace with the user's first name
          email : email ,
        },
        verify: {
          URL: `https://sourcedfounder.com/users/confirm?confirmation_token=${otp}`,
          otp :otp,
        },
      },
    });
    console.log('Verification email sent:', response);
    return otp; // Return OTP to be stored or used for verification
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

router.post('/signup',
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
    const { email, password, username, confirmPassword } = req.body; 
    sendVerificationEmail(email , username)
    .then((otp) => {
      console.log('Verification email sent successfully. OTP:', otp);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
      }
      user = new User({
        email,
        password,
        username ,  
        confirmPassword
      });
      await user.save();
      const accessToken = generateAccessToken ({user: user})
      res.status(201).json ({accessToken: accessToken})
      next();
    } catch (error) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// POST route for user login
router.post('/login',
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
      res.json ({accessToken: accessToken})
    } catch (error) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

router.post(
  '/verification',async (req, res) => {

  
    const { otp_user} = req.body;

    try {
    console.log('otp' , otp)
    if(otp === otp_user){
      res.status(201).json({ message: 'Signup SuccessFull', success: true });
    }
    else{
      res.status(201).json({ message: 'Wrong otp', success: false });
    }
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);


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
    res.json({data: user[0]});
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
  
// Add Education 
router.post(
  '/add-education',
  [
    check('userId').isMongoId().withMessage('Invalid user ID'),
    check('school').notEmpty().withMessage('School is required'),
    check('degree').notEmpty().withMessage('Degree is required'),
    check('fieldOfStudy').notEmpty().withMessage('Field of study is required'),
    check('startMonth').isNumeric().withMessage('Start month must be a number'),
    check('startYear').isNumeric().withMessage('Start year must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, school, degree, fieldOfStudy, grade, description, location, startMonth, startYear, endMonth, endYear } = req.body;

    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      // Constructing startDate and endDate from provided values
      const startDate = new Date(startYear, startMonth - 1, 1); // Month is 0-indexed in JavaScript Date object
      const endDate = endYear ? new Date(endYear, endMonth - 1, 1) : undefined;

      // Create a new education entry
      const newEducation = new Education({
        user: userId,
        school,
        degree,
        fieldOfStudy,
        grade,
        location,
        description,
        startDate,
        endDate,
      });

      await newEducation.save();

      // Link the new education entry to the user's education array
      if (!user.education) {
        user.education = []; // Initialize the education array if it doesn't exist
      }
      user.education.push(newEducation._id);
      await user.save();

      res.status(201).json({ message: 'Education entry added successfully', success: true, education: newEducation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Edit Education
router.put(
  '/edit-education/:educationId',
  [
    check('userId').isMongoId().withMessage('Invalid user ID'),
    check('school').notEmpty().withMessage('School is required'),
    check('degree').notEmpty().withMessage('Degree is required'),
    check('fieldOfStudy').notEmpty().withMessage('Field of study is required'),
    check('startMonth').isNumeric().withMessage('Start month must be a number'),
    check('startYear').isNumeric().withMessage('Start year must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, school, degree, fieldOfStudy, grade, description, startMonth, location, startYear, endMonth, endYear } = req.body;
    const { educationId } = req.params;

    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      // Check if the education entry exists
      const education = await Education.findById(educationId);
      if (!education) {
        return res.status(404).json({ errors: [{ msg: 'Education entry not found' }] });
      }

      // Constructing startDate and endDate from provided values
      const startDate = new Date(startYear, startMonth - 1, 1); // Month is 0-indexed in JavaScript Date object
      const endDate = endYear ? new Date(endYear, endMonth - 1, 1) : undefined;

      // Update the education entry
      education.school = school;
      education.degree = degree;
      education.fieldOfStudy = fieldOfStudy;
      education.grade = grade;
      education.location = location;
      education.description = description;
      education.startDate = startDate;
      education.endDate = endDate;

      await education.save();

      res.status(200).json({ message: 'Education entry updated successfully', success: true, education });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Delete Education
router.delete('/delete-education/:educationId', async (req, res) => {
  const { educationId } = req.params;
  try {
    // Check if the education entry exists
    const education = await Education.findById(educationId);
    if (!education) {
      return res.status(404).json({ errors: [{ msg: 'Education entry not found' }] });
    }

    // Mark the education entry as deleted
    education.isDeleted = true;
    await education.save();
    console.log(education)
    // Remove the education entry ID from the user's education array
    const user = await  User.findByIdAndUpdate(education.user, { $pull: { education: education._id } });  

    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    res.status(200).json({ message: 'Education entry deleted successfully', success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Get all Education
router.get('/get-all-education', async (req, res) => {
  try {
    const { user, page, pageSize } = req.query;

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1, // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const educationEntries = await Education.find({ user: user, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize);

    const totalEducationEntries = await Education.countDocuments({ user: user, isDeleted: false });

    const totalPages = Math.ceil(totalEducationEntries / pageOptions.pageSize);

    res.status(200).json({
      educationEntries,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalEducationEntries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Experience
router.post(
  '/add-experience',
   async (req, res) => {
  try {
    const { userId, title, industry, description, employmentType, companyName, locationType, skills, location, startMonth, startYear, endMonth, endYear } = req.body;
    
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = endYear ? new Date(endYear, endMonth - 1, 1) : undefined;
    
    // Create a new experience
    const newExperience = new Experience({
      user: userId,
      title,
      industry,
      companyName,
      description,
      employmentType,
      locationType,
      skills,
      location,
      startDate,
      endDate,
    });

    // Save the experience to the database
    const savedExperience = await newExperience.save();

    // Add the experience to the user's experience array
    await User.findByIdAndUpdate(userId, { $push: { experience: savedExperience._id } });

    res.status(201).json({ success: true, data: savedExperience });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Edit Experience
router.put('/edit-experience/:experienceId', async (req, res) => {
  try {
    const { title, industry, description, employmentType, locationType, companyName, skills, location, startMonth, startYear, endMonth, endYear } = req.body;
    const { experienceId } = req.params;

    // Validate input data here

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = endYear ? new Date(endYear, endMonth - 1, 1) : undefined;

    // Find the experience by ID
    const existingExperience = await Experience.findById(experienceId);

    if (!existingExperience) {
      return res.status(404).json({ success: false, error: 'Experience not found' });
    }

    // Update the experience fields
    existingExperience.title = title;
    existingExperience.industry = industry;
    existingExperience.description = description;
    existingExperience.employmentType = employmentType;
    existingExperience.companyName = companyName;
    existingExperience.locationType = locationType;
    existingExperience.skills = skills;
    existingExperience.location = location;
    existingExperience.startDate = startDate;
    existingExperience.endDate = endDate;

    // Save the updated experience
    const updatedExperience = await existingExperience.save();

    res.status(200).json({ success: true, data: updatedExperience });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Delete Experience
router.delete('/delete-experience/:experienceId', async (req, res) => {
  try {
    const { experienceId } = req.params;
    const existingExperience = await Experience.findById(experienceId);

    if (!existingExperience) {
      return res.status(404).json({ success: false, error: 'Experience not found' });
    }
    existingExperience.isDeleted = true;

    const updatedExperience = await existingExperience.save();

    await User.findByIdAndUpdate(existingExperience.user, { $pull: { experience: experienceId } });

    res.status(200).json({ success: true, data: updatedExperience });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Get Experiences
router.get('/get-all-experience', async (req, res) => {
  try {
    const { user, page, pageSize } = req.query;

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1, // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const experienceEntries = await Experience.find({ user: user, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize)
      .sort({ startDate: -1 }); // Sorting by start date in descending order, modify as needed

    const totalExperienceEntries = await Experience.countDocuments({ user: user, isDeleted: false });

    const totalPages = Math.ceil(totalExperienceEntries / pageOptions.pageSize);

    res.status(200).json({
      experienceEntries,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalExperienceEntries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Skill
router.post(
  '/add-skill',
  [
    check('userId').isMongoId().withMessage('Invalid user ID'),
    check('skillName').notEmpty().withMessage('Skill is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, skillName} = req.body;

    try {

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      const newSkill = new Skill({
        user: userId,
        skillName,
      });

      await newSkill.save();

      if (!user.skill) {
        user.skill = []; 
      }
      user.skill.push(newSkill._id);
      await user.save();

      res.status(201).json({ message: 'Skill entry added successfully', success: true, skill: newSkill });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Delete Skill
router.delete('/delete-skill/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    const existingSkill = await Skill.findById(skillId);

    if (!existingSkill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    existingSkill.isDeleted = true;

    const updatedSkill = await existingSkill.save();

    await User.findByIdAndUpdate(existingSkill.user, { $pull: { skill: skillId } });

    res.status(200).json({ success: true, data: updatedSkill });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Get All skills
router.get('/get-all-skill', async (req, res) => {
  try {
    const { user, page, pageSize } = req.query;

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const skillEntries = await Skill.find({ user: user, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize)

    const totalSkillEntries = await Skill.countDocuments({ user: user, isDeleted: false });

    const totalPages = Math.ceil(totalSkillEntries / pageOptions.pageSize);

    res.status(200).json({
      skillEntries,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalSkillEntries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Teams of User
router.get('/get-all-teams', async (req, res) => {
  try {
    const { userId, page, pageSize } = req.query;

    const user = await User.findById(userId).select('teams').populate('teams', '_id teamName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1, // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const teams = user.teams || []; // Handle the case where user.teams might be null

    const paginatedTeams = teams.slice(skip, skip + pageOptions.pageSize);
  
    const totalTeamsEntries = teams.length;
    const totalPages = Math.ceil(totalTeamsEntries / pageOptions.pageSize);

    res.status(200).json({
      teamEntries: paginatedTeams,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalTeamsEntries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Proficient Languages 
router.post('/add-language', async (req, res) => {
  const {userId, language} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (language) {
      user.proficientLanguages.push(req.body.language);
    } else {
      return res.status(400).json({ message: 'Language not provided in the request body' });
    }
    await user.save();
    res.status(200).json({ message: 'Language added successfully', username: user.username, proficientLanguages: user.proficientLanguages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE language from proficientLanguages
router.delete('/delete-language/:userId', async (req, res) => {
  const userId = req.params.userId;
  const {language} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const languageIndex = user.proficientLanguages.indexOf(language);
    if (languageIndex === -1) {
      return res.status(404).json({ message: 'Language not found in proficientLanguages' });
    }
    user.proficientLanguages.splice(languageIndex, 1);
    await user.save();
    res.json({ message: 'Language removed successfully', username: user.username, proficientLanguages: user.proficientLanguages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update User's details
router.put('/update-user-details', async (req, res) => {
  const {userId, firstName, middleName, lastName, about, tagLine, currentStatus, currentIndustry, currentLocation, isMailPublic, birthDate} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(firstName){
      user.firstName = firstName
    }
    if(middleName){
      user.middleName = middleName
    }
    if(lastName){
      user.lastName = lastName
    }
    if(about){
      user.about = about
    }
    if(tagLine){
      user.tagLine = tagLine
    }
    if(currentStatus){
      user.currentStatus = currentStatus
    }
    if(currentIndustry){
      user.currentIndustry = currentIndustry
    }
    if(currentLocation){
      user.currentLocation = currentLocation
    }
    if(isMailPublic){
      user.isMailPublic = isMailPublic
    }
    if(birthDate){
      user.birthDate = birthDate
    }

    await user.save();
    res.status(200).json({ message: 'Language added successfully',
      username: user.username, 
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      about: user.about,
      tagLine: user.tagLine,
      currentStatus: user.currentStatus,
      currentIndustry: user.currentIndustry,
      currentLocation: user.currentLocation, 
      isMailPublic: user.isMailPublic,
      birthDate: user.birthDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/search', async (req, res) => {
  const { type, query, limit } = req.query;

  try {
    let results = [];
    switch (type) {
      case 'FIRST_NAME':
        results = await User.find({ firstName: { $regex: query, $options: 'i' } }, 'username firstName lastName _id').limit(parseInt(limit, 10) || 10);
        break;
      case 'USER_HANDLE':
        results = await User.find({ username: { $regex: query, $options: 'i' } }, 'username firstName lastName _id').limit(parseInt(limit, 10) || 10);
        break;
      default:
        res.status(400).json({ error: 'Invalid search type' });
        return;
    }

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;