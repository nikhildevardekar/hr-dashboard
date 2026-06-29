const mongoose = require('mongoose')

const interviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
  interviewer: { type: String },
  feedback: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
}, { timestamps: true })

module.exports = mongoose.model('Interview', interviewSchema)