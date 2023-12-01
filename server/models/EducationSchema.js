const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school: {type: String, required: true},
  degree: {type: String, required: true},
  fieldOfStudy: {type: String, required: true},
  grade:{type: String, required: true},
  description: {type: String, required: true},
  skills: [{type: String}],
  location: {type: String},
  startDate: {type: Date},
  endDate: {type: Date},
});
const EducationSchema = mongoose.model('EducationSchema', educationSchema);
module.exports = EducationSchema;