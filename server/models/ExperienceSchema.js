const EmploymentTypes = require('../enums/EmploymentTypes');
const LocationTypes = require('../enums/LocationTypes');
const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: {type: String, required: true},
  industry: {type: String},
  description: {type: String},
  employmentType:{type: String, enum: EmploymentTypes, required: true},
  locationType: {type: String, enum: LocationTypes, required: true},
  skills: [{type: String}],
  location: { type: String, required: function() {
    return this.locationType !== "REMOTE";
  }},
  startDate: {type: Date},
  endDate: {type: Date, default: null},
  isDeleted: {type: Boolean, default: false},
},
{
  timestamps: true,
  validate: [
    {
      validator: function () {
        return !this.startDate || !this.endDate || this.startDate <= this.endDate;
      },
      message: 'End date must be greater than or equal to start date.',
    },
  ],
});
const ExperienceSchema = mongoose.model('ExperienceSchema', experienceSchema);
module.exports = ExperienceSchema;