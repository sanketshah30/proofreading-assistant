export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Suggestion {
  id: string
  type: 'grammar' | 'paraphrase' | 'consistency' | 'style' | 'citation' | 'plagiarism' | 'other'
  original: string
  suggested: string
  context?: string
  lineNumber?: number | null
  reason: string
}

export interface ChatRequest {
  documentContent: string
  userQuery: string
  conversationHistory?: Message[]
}

export interface ChatResponse {
  content: string
  suggestions: Suggestion[]
}

