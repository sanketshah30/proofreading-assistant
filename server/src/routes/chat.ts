import express from 'express'
import { analyzeDocument } from '../services/geminiService.js'
import type { ChatRequest, ChatResponse } from '../types/index.js'

const router = express.Router()

router.post('/', async (req: express.Request, res: express.Response) => {
  const requestId = Date.now().toString()
  console.log(`[${requestId}] 📥 Received chat request`)
  
  try {
    const { documentContent, userQuery, conversationHistory }: ChatRequest = req.body

    // Log request details
    console.log(`[${requestId}] Request details:`, {
      hasDocumentContent: !!documentContent,
      documentLength: documentContent?.length || 0,
      hasUserQuery: !!userQuery,
      userQueryLength: userQuery?.length || 0,
      conversationHistoryLength: conversationHistory?.length || 0,
      userQuery: userQuery?.substring(0, 100) + (userQuery?.length > 100 ? '...' : '')
    })

    if (!documentContent) {
      console.error(`[${requestId}] ❌ Validation error: Document content is required`)
      return res.status(400).json({ error: 'Document content is required' })
    }

    if (!userQuery) {
      console.error(`[${requestId}] ❌ Validation error: User query is required`)
      return res.status(400).json({ error: 'User query is required' })
    }

    console.log(`[${requestId}] 🔄 Calling Gemini service...`)
    const startTime = Date.now()
    
    // Analyze document with Gemini
    const response = await analyzeDocument(documentContent, userQuery, conversationHistory || [], requestId)

    const duration = Date.now() - startTime
    console.log(`[${requestId}] ✅ Gemini service completed in ${duration}ms`)
    console.log(`[${requestId}] Response details:`, {
      contentLength: response.content?.length || 0,
      suggestionsCount: response.suggestions?.length || 0,
      contentPreview: response.content?.substring(0, 100) + (response.content?.length > 100 ? '...' : '')
    })

    res.json(response)
    console.log(`[${requestId}] 📤 Response sent successfully`)
  } catch (error: any) {
    const duration = Date.now() - (parseInt(requestId) || Date.now())
    console.error(`[${requestId}] ❌ Error processing chat request (after ${duration}ms):`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    })
    
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message || 'An unexpected error occurred',
      requestId: requestId
    })
  }
})

export default router

