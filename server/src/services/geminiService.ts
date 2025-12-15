import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChatResponse, Suggestion, Message } from '../types/index.js'

// Lazy initialization - only initialize when function is called (after dotenv.config() has run)
let genAI: GoogleGenerativeAI | null = null
let model: any = null

function getModel() {
  if (!model) {
    const API_KEY = process.env.GEMINI_API_KEY
    
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      console.error('❌ GEMINI_API_KEY check failed:', {
        isSet: !!process.env.GEMINI_API_KEY,
        length: process.env.GEMINI_API_KEY?.length
      })
      throw new Error('GEMINI_API_KEY is not set in environment variables. Please set it in your .env file in the server folder.')
    }
    
    console.log(`✅ Initializing Gemini model with API key (length: ${API_KEY.length} chars)`)
    genAI = new GoogleGenerativeAI(API_KEY)
    
    // Use model from env or default to gemini-pro
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    model = genAI.getGenerativeModel({ model: modelName })
    console.log(`✅ Using model: ${modelName}`)
  }
  
  return model
}

/**
 * Analyzes document content and generates suggestions based on user query
 */
export async function analyzeDocument(
  documentContent: string,
  userQuery: string,
  conversationHistory: Message[] = [],
  requestId?: string
): Promise<ChatResponse> {
  const logPrefix = requestId ? `[${requestId}]` : '[Gemini]'
  console.log(`${logPrefix} 🔍 Starting document analysis`)
  
  try {
    // Get model (will initialize and check API key if needed)
    const geminiModel = getModel()
    const API_KEY = process.env.GEMINI_API_KEY
    console.log(`${logPrefix} ✅ API key is configured (length: ${API_KEY?.length || 0} chars)`)
    
    // Build the prompt with document context and conversation history
    console.log(`${logPrefix} 📝 Building prompt...`)
    const systemPrompt = buildSystemPrompt()
    const conversationContext = buildConversationContext(conversationHistory)
    const documentContext = buildDocumentContext(documentContent)
    
    // Determine if user wants document analysis or just conversation
    const isAnalysisRequest = shouldAnalyzeDocument(userQuery, conversationHistory)
    
    const fullPrompt = `${systemPrompt}

${conversationContext}

${isAnalysisRequest ? documentContext : `Document is available for analysis when needed. Current document has ${documentContent.split(/\s+/).filter(w => w.length > 0).length} words.`}

User Query: ${userQuery}

${isAnalysisRequest ? `The user wants you to analyze the document. Please provide suggestions in the following JSON format:
{
  "response": "Your natural language response explaining the suggestions",
  "suggestions": [
    {
      "id": "unique-id",
      "type": "grammar|paraphrase|consistency|style|other",
      "original": "exact text to replace",
      "suggested": "suggested replacement text",
      "context": "surrounding text for context (2-3 lines)",
      "lineNumber": approximate line number where this appears,
      "reason": "explanation for the suggestion"
    }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown formatting
- Include exact line numbers where possible
- Provide specific, actionable suggestions
- If no suggestions, return empty suggestions array
- Ensure all JSON is properly escaped` : `The user is having a conversation. Respond naturally and helpfully. You can:
- Answer questions about your capabilities
- Provide general writing advice
- Explain how to use the assistant
- Have a friendly conversation

Only analyze the document if the user explicitly asks for it (e.g., "check grammar", "review this", "find errors", "suggest improvements").

Return your response in this JSON format:
{
  "response": "Your natural, conversational response to the user",
  "suggestions": []
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting
- Keep suggestions array empty for conversational responses
- Be friendly, helpful, and concise`}`

    const promptLength = fullPrompt.length
    console.log(`${logPrefix} 📊 Prompt statistics:`, {
      totalLength: promptLength,
      documentLength: documentContent.length,
      userQueryLength: userQuery.length,
      conversationHistoryLength: conversationHistory.length
    })

    console.log(`${logPrefix} 🤖 Sending request to Gemini API...`)
    const geminiStartTime = Date.now()
    
    let result, response, text
    try {
      result = await geminiModel.generateContent(fullPrompt)
      response = result.response
      text = response.text()
    } catch (apiError: any) {
      console.error(`${logPrefix} ❌ Gemini API call failed:`, {
        name: apiError?.name,
        message: apiError?.message,
        stack: apiError?.stack,
        status: apiError?.status,
        statusText: apiError?.statusText
      })
      throw new Error(`Gemini API error: ${apiError.message}`)
    }
    
    const geminiDuration = Date.now() - geminiStartTime
    console.log(`${logPrefix} ✅ Received response from Gemini in ${geminiDuration}ms`)
    console.log(`${logPrefix} 📄 Response length: ${text.length} characters`)
    console.log(`${logPrefix} 📄 Response preview: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`)

    // Parse the JSON response
    console.log(`${logPrefix} 🔧 Parsing JSON response...`)
    let parsedResponse: any
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      console.log(`${logPrefix} 🧹 Cleaned text length: ${cleanedText.length}`)
      parsedResponse = JSON.parse(cleanedText)
      console.log(`${logPrefix} ✅ Successfully parsed JSON`)
    } catch (parseError: any) {
      console.error(`${logPrefix} ❌ Failed to parse JSON response:`, {
        error: parseError.message,
        errorName: parseError.name,
        textPreview: text.substring(0, 500)
      })
      
      // Fallback: try to extract JSON from the response
      console.log(`${logPrefix} 🔄 Attempting fallback JSON extraction...`)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0])
          console.log(`${logPrefix} ✅ Fallback JSON parsing successful`)
        } catch (fallbackError: any) {
          console.error(`${logPrefix} ❌ Fallback parsing also failed:`, fallbackError.message)
          throw new Error(`Invalid JSON response from Gemini: ${parseError.message}`)
        }
      } else {
        console.error(`${logPrefix} ❌ No JSON object found in response`)
        throw new Error('Invalid JSON response from Gemini: No JSON object found in response')
      }
    }

    // Validate and format the response
    console.log(`${logPrefix} ✅ Validating and formatting suggestions...`)
    const rawSuggestions = parsedResponse.suggestions || []
    console.log(`${logPrefix} 📋 Found ${rawSuggestions.length} raw suggestions`)
    
    const suggestions: Suggestion[] = rawSuggestions.map((s: any, index: number) => {
      const suggestion = {
        id: s.id || `suggestion-${Date.now()}-${index}`,
        type: s.type || 'other',
        original: s.original || '',
        suggested: s.suggested || '',
        context: s.context || '',
        lineNumber: s.lineNumber || null,
        reason: s.reason || 'No reason provided'
      }
      console.log(`${logPrefix}   - Suggestion ${index + 1}: ${suggestion.type} (line ${suggestion.lineNumber || 'N/A'})`)
      return suggestion
    })

    const finalResponse = {
      content: parsedResponse.response || text,
      suggestions
    }
    
    console.log(`${logPrefix} ✅ Document analysis completed successfully`)
    console.log(`${logPrefix} 📊 Final response:`, {
      contentLength: finalResponse.content.length,
      suggestionsCount: finalResponse.suggestions.length
    })

    return finalResponse
  } catch (error: any) {
    console.error(`${logPrefix} ❌ Error in Gemini service:`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    })
    throw new Error(`Failed to analyze document: ${error.message}`)
  }
}

function buildSystemPrompt(): string {
  return `You are an expert writing assistant specialized in academic and research document review. Your role is to:

1. Understand user intent - distinguish between conversational queries and document analysis requests
2. For conversational queries (greetings, questions, general chat): Respond naturally and helpfully without analyzing the document
3. For analysis requests: Analyze documents for grammar, clarity, consistency, and style
4. Provide specific, actionable suggestions with exact text replacements when analysis is requested
5. Include line numbers and context for each suggestion
6. Maintain the author's voice while improving quality
7. Focus on academic writing standards and best practices

When providing suggestions:
- Be specific and precise
- Include the exact text to replace
- Provide clear explanations
- Consider the document's context and purpose
- Prioritize clarity and correctness

When having a conversation:
- Be friendly, professional, and helpful
- Explain your capabilities clearly
- Only analyze the document when explicitly asked`
}

/**
 * Determines if the user query requires document analysis
 */
function shouldAnalyzeDocument(userQuery: string, conversationHistory: Message[]): boolean {
  const query = userQuery.toLowerCase().trim()
  
  // Analysis keywords that indicate user wants document review
  const analysisKeywords = [
    'check', 'review', 'analyze', 'analyze', 'proofread', 'proofread',
    'grammar', 'spelling', 'error', 'mistake', 'suggest', 'improve',
    'fix', 'correct', 'edit', 'revise', 'paraphrase', 'rewrite',
    'consistency', 'style', 'clarity', 'find', 'identify', 'look for',
    'what\'s wrong', 'what are the issues', 'help with', 'assist with',
    'change', 'modify', 'update', 'better', 'improvement'
  ]
  
  // Check if query contains analysis keywords
  const hasAnalysisKeyword = analysisKeywords.some(keyword => query.includes(keyword))
  
  // Check if it's a greeting or conversational query
  const conversationalKeywords = [
    'hi', 'hello', 'hey', 'greetings', 'how are you', 'what can you do',
    'help', 'thanks', 'thank you', 'bye', 'goodbye', 'what is', 'what are',
    'explain', 'tell me about', 'who are you', 'introduce'
  ]
  
  const isConversational = conversationalKeywords.some(keyword => query.includes(keyword))
  
  // If it's clearly conversational and doesn't mention analysis, don't analyze
  if (isConversational && !hasAnalysisKeyword && query.length < 50) {
    return false
  }
  
  // If it has analysis keywords, definitely analyze
  if (hasAnalysisKeyword) {
    return true
  }
  
  // Check conversation history - if previous messages were about analysis, continue
  if (conversationHistory.length > 0) {
    const lastFewMessages = conversationHistory.slice(-3)
    const hasAnalysisContext = lastFewMessages.some(msg => 
      analysisKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
    )
    if (hasAnalysisContext) {
      return true
    }
  }
  
  // Default: if query is longer and seems like a request, analyze
  // If it's short and conversational, don't analyze
  return query.length > 20 && !isConversational
}

function buildDocumentContext(documentContent: string): string {
  // Split document into lines for line number reference
  const lines = documentContent.split('\n')
  const numberedLines = lines.map((line, index) => `Line ${index + 1}: ${line}`).join('\n')
  
  return `Document Content (with line numbers):
${numberedLines}

Total lines: ${lines.length}
Total words: ${documentContent.split(/\s+/).filter(w => w.length > 0).length}`
}

function buildConversationContext(history: Message[]): string {
  if (history.length === 0) {
    return 'Conversation History: None (this is the first message)'
  }

  const recentHistory = history.slice(-5) // Last 5 messages for context
  const context = recentHistory.map(msg => 
    `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n')

  return `Conversation History (recent messages):
${context}`
}

