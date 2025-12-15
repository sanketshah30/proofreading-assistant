import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env FIRST, before importing any routes/services that need env vars
// Try server folder first, then fall back to root
const serverEnvPath = path.resolve(__dirname, '../.env')
const rootEnvPath = path.resolve(__dirname, '../../.env')

let envResult
if (existsSync(serverEnvPath)) {
  console.log(`📁 Loading .env from: ${serverEnvPath}`)
  envResult = dotenv.config({ path: serverEnvPath })
} else if (existsSync(rootEnvPath)) {
  console.log(`📁 Loading .env from: ${rootEnvPath}`)
  envResult = dotenv.config({ path: rootEnvPath })
} else {
  console.warn(`⚠️ No .env file found in ${serverEnvPath} or ${rootEnvPath}`)
  envResult = { error: new Error('No .env file found') }
}

if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error)
} else {
  console.log('✅ .env file loaded successfully')
  console.log(`📋 Environment variables loaded:`, {
    PORT: process.env.PORT || '3001 (default)',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173 (default)'
  })
}

// NOW import routes after env is loaded
import chatRoutes from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proofreading Assistant API is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 CORS enabled for: ${CORS_ORIGIN}`)
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ NOT SET'}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`)
})

export default app

