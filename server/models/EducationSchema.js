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
}
);
const EducationSchema = mongoose.model('EducationSchema', educationSchema);
module.exports = EducationSchema;