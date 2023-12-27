const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: false },
  isMailPublic: {type: Boolean, default: false},
  birthDate: {type: Date},
  
  firstName: {type: String},
  middleName: {type: String},
  lastName: {type: String},
  about: {type: String},
  tagLine: {type: String},
  currentStatus: {type: String},
  
  currentIndustry: {type: String},
  skill: [{type: mongoose.Schema.Types.ObjectId, ref: 'SkillSchema'}],
  education: [{type: mongoose.Schema.Types.ObjectId, ref: 'EducationSchema' }],
  experience: [{type: mongoose.Schema.Types.ObjectId, ref: 'ExperienceSchema'}],

  proficientLanguages: [{type: String}],
  currentLocation: {type: String},
  teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema'}],
  authouredContests: [{type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema'}],
  submissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'SubmissionSchema'}],
  publications: [{type: String}],
  projects: [{type: String}], 
  github: {type: String},
  website: {type: String},
  articles: [{type: String}],
});

// Hash and salt the password before saving the user
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      // Only hash the password if it's being modified (i.e., during signup or password change)
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.confirmPassword = undefined; // Clear the confirmPassword field after hashing
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
