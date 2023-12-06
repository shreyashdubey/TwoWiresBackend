const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  skill: [{type: mongoose.Schema.Types.ObjectId, ref: 'SkillSchema'}],
  education: [{type: mongoose.Schema.Types.ObjectId, ref: 'EducationSchema' }],
  experience: [{type: mongoose.Schema.Types.ObjectId, ref: 'ExperienceSchema'}],
  skills: [{ type: String }],
  confirmPassword: { type: String, required: false },
  teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema'}],
  authouredContests: [{type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema'}],
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
