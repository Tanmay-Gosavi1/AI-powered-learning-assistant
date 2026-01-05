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
import aiRoutes from './routes/aiRoute.js'
import quizRoutes from './routes/quizRoute.js'
import progressRoutes from './routes/progressRoutes.js'
import insightRoutes from './routes/insightRoute.js'

// Connect to Database
connectDB()

// __dirname setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
// app.use(helmet())
// Allow embedding by removing X-Frame-Options and setting permissive CSP
app.use((req, res, next) => {
  try {
    res.removeHeader('X-Frame-Options')
    // Allow any ancestor to frame (adjust for production as needed)
    res.setHeader('Content-Security-Policy', 'frame-ancestors *')
  } catch {}
  next()
})

// CORS configuration
const corsOptions = {
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(errorHandler)

// Sample Route
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.removeHeader('X-Frame-Options')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  }
}))
app.get('/', (req, res) => {
  res.send('Hello, World!')
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/docs', docRoutes)
app.use('/api/flashcards', FlashcardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/quiz' , quizRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/insights', insightRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.API_URL}`)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message)
  process.exit(1)
}) 