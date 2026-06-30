const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const Candidate = require('../models/Candidate')
const auth = require('../middleware/auth')
const { sendStatusEmail } = require('../utils/mailer')

// Use memory storage instead of disk
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files allowed'))
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Get all candidates
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'manager' ? {} : { addedBy: req.user.id }
    const candidates = await Candidate.find(query).populate('addedBy', 'name')
    res.json(candidates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add candidate
router.post('/', auth, async (req, res) => {
  try {
    const candidate = new Candidate({
      ...req.body,
      addedBy: req.user.id,
      addedByName: req.user.name
    })
    const saved = await candidate.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Upload resume as base64 in MongoDB
router.post('/:id/resume', auth, upload.single('resume'), async (req, res) => {
  try {
    const base64 = req.file.buffer.toString('base64')
    const resumeUrl = 'data:application/pdf;base64,' + base64
    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      { resumeUrl },
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Update candidate
router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (req.body.status) {
      sendStatusEmail(updated.email, updated.name, req.body.status)
        .catch(err => console.log('Email error:', err.message))
    }
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete candidate
router.delete('/:id', auth, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id)
    res.json({ message: 'Candidate deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }

})
router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (req.body.status) {
      console.log('Attempting to send email to:', updated.email, 'for status:', req.body.status)
      sendStatusEmail(updated.email, updated.name, req.body.status)
        .then(() => console.log('Email sent successfully!'))
        .catch(err => console.log('EMAIL FAILED:', err.message))
    }
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})
module.exports = router