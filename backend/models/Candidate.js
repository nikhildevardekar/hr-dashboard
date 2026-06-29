const mongoose = require('mongoose')

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  position: { type: String },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  location: { type: String },
  currentCTC: { type: String },
  expectedCTC: { type: String },
  noticePeriod: { type: String },
  remarks: { type: String },
  resumeUrl: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedByName: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Candidate', candidateSchema)