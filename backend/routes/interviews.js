const express = require('express')
const router = express.Router()
const Interview = require('../models/Interview')
const Candidate = require('../models/Candidate')
const auth = require('../middleware/auth')
const { sendInterviewEmail } = require('../utils/mailer')

router.get('/', auth, async (req, res) => {
  try {
    const interviews = await Interview.find().populate('candidate', 'name position addedBy')
    const filtered = req.user.role === 'manager'
      ? interviews
      : interviews.filter(i => i.candidate?.addedBy?.toString() === req.user.id)
    res.json(filtered)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const interview = new Interview(req.body)
    const saved = await interview.save()
    const populated = await saved.populate('candidate', 'name position email')

    // Send interview scheduled email
    const c = populated.candidate
    if (c?.email) {
      sendInterviewEmail(
        c.email,
        c.name,
        req.body.date,
        req.body.time,
        req.body.mode,
        req.body.interviewer
      ).catch(err => console.log('Interview email error:', err.message))
    }

    res.status(201).json(populated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Interview.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).populate('candidate', 'name position')
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id)
    res.json({ message: 'Interview deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router