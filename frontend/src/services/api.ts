import type { Message, Suggestion } from '../types'

// Use proxy in development, or direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface ChatRequest {
  documentContent: string
  userQuery: string
  conversationHistory?: Message[]
}

export interface ChatResponse {
  content: string
  suggestions: Suggestion[]
}

/**
 * Sends a chat message to the backend API
 */
export async function sendChatMessage(
  documentContent: string,
  userQuery: string,
  conversationHistory: Message[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentContent,
        userQuery,
        conversationHistory: conversationHistory.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`)
    }

    const data: ChatResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('Error sending chat message:', error)
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to the backend server. Please make sure the server is running on http://localhost:3001')
    }
    throw error
  }
}

/**
 * Health check for the API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
    return response.ok
  } catch {
    return false
  }
}

