const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const candidateRoutes = require('./routes/candidates')
const authRoutes = require('./routes/auth')
const interviewRoutes = require('./routes/interviews')

const app = express()

app.use(cors({
  origin: [
    'https://hr-dashboard-ftc6xbgfy-nikhildevardekar11.vercel.app',
    'http://localhost:5173'
  ]
}))

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('DB Error:', err))

app.use('/api/candidates', candidateRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/interviews', interviewRoutes)

app.get('/', (req, res) => {
  res.send('HR Dashboard API is running!')
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})