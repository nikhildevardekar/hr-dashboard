const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Candidate = require('../models/Candidate')
const auth = require('../middleware/auth')
const { sendStatusEmail } = require('../utils/mailer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files allowed'))
  }
})

// Get candidates — HR sees own, Manager sees all
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'manager' ? {} : { addedBy: req.user.id }
    const candidates = await Candidate.find(query).populate('addedBy', 'name')
    res.json(candidates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add candidate — always tagged to the HR who added it
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

// Upload resume
router.post('/:id/resume', auth, upload.single('resume'), async (req, res) => {
  try {
    const resumeUrl = '/uploads/' + req.file.filename
    const updated = await Candidate.findByIdAndUpdate(
      req.params.id, { resumeUrl }, { new: true }
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
      req.params.id, req.body, { new: true }
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

module.exports = router