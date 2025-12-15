export type MessageType = 'user' | 'assistant'
export type SuggestionType = 'grammar' | 'paraphrase' | 'consistency' | 'citation' | 'plagiarism' | 'style' | 'other'

export interface Message {
  id: string
  type: MessageType
  content: string
  suggestions?: Suggestion[]
  timestamp: Date
}

export interface Suggestion {
  id: string
  type: SuggestionType
  original: string
  suggested: string
  context?: string
  lineNumber?: number | null
  reason: string
  newContent?: string
}

