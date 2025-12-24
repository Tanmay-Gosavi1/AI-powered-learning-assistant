import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import connectDB from './config/db.js'
import path from 'path'
import { fileURLToPath } from 'url'
import errorHandler from './middlewares/errorHandler.js'
import authRoutes from './routes/authRoute.js'
import docRoutes from './routes/docRoute.js'
import FlashcardRoutes from './routes/flashcardRoute.js'

// Connect to Database
connectDB()

// __dirname setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(errorHandler)

// Sample Route
app.use('/uploads' , express.static(path.join(__dirname, 'uploads')))
app.get('/', (req, res) => {
  res.send('Hello, World!')
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/docs', docRoutes)
app.use('/api/flashcards', FlashcardRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message)
  process.exit(1)
}) 