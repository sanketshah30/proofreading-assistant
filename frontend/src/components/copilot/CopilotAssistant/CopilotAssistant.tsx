import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react'
import { FaPaperPlane, FaSpellCheck, FaEdit, FaCheckCircle, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message, Suggestion } from '../../../types'
import { sendChatMessage } from '../../../services/api'
import './CopilotAssistant.css'

interface CopilotAssistantProps {
  documentContent: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onTotalAlertsChange?: (count: number) => void
  onApplySuggestion: (suggestion: Suggestion, originalText: string, suggestedText: string) => void
}

export interface CopilotAssistantHandle {
  addToChat: (text: string) => void
  draftToChat: (text: string) => void
}

const CopilotAssistant = forwardRef<CopilotAssistantHandle, CopilotAssistantProps>(
  ({ documentContent, isCollapsed = false, onToggleCollapse, onTotalAlertsChange, onApplySuggestion }, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your writing assistant. I can help you with grammar, paraphrasing, consistency checks, and more. Just ask me anything!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate total alerts from all suggestions
  const totalAlerts = useMemo(() => {
    return messages.reduce((count, message) => {
      return count + (message.suggestions?.length || 0)
    }, 0)
  }, [messages])

  // Notify parent of total alerts change
  useEffect(() => {
    if (onTotalAlertsChange) {
      onTotalAlertsChange(totalAlerts)
    }
  }, [totalAlerts, onTotalAlertsChange])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const quickActions = [
    { icon: <FaSpellCheck />, label: 'Check Grammar', action: 'checkGrammar' },
    { icon: <FaEdit />, label: 'Paraphrase', action: 'paraphrase' },
    { icon: <FaCheckCircle />, label: 'Consistency Check', action: 'consistency' },
  ]

  const handleQuickAction = async (action: string) => {
    let prompt = ''
    switch (action) {
      case 'checkGrammar':
        prompt = 'Check this document for grammar errors and suggest corrections.'
        break
      case 'paraphrase':
        prompt = 'Help me paraphrase sections of this document to improve clarity.'
        break
      case 'consistency':
        prompt = 'Check this document for consistency in terminology, style, and formatting.'
        break
    }
    await handleSend(prompt)
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Send request to backend API
      const conversationHistory = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }))

      const response = await sendChatMessage(documentContent, messageText, conversationHistory)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        suggestions: response.suggestions,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to process your request'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySuggestion = async (suggestedText: string) => {
    try {
      await navigator.clipboard.writeText(suggestedText)
      // You could add a toast notification here
      console.log('Copied to clipboard:', suggestedText)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleApplySuggestion = (suggestion: Suggestion, messageId: string) => {
    // Pass the original and suggested text to the parent
    // The parent will handle applying it to the document editor
    // Also pass context to help find the right occurrence
    onApplySuggestion(suggestion, suggestion.original, suggestion.suggested)
    
    // Remove the suggestion from the message
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id) }
          : msg
      )
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Expose addToChat and draftToChat methods via ref
  useImperativeHandle(ref, () => ({
    addToChat: (text: string) => {
      setInput(text)
      inputRef.current?.focus()
      // Optionally auto-send
      setTimeout(() => {
        handleSend(text)
      }, 100)
    },
    draftToChat: (text: string) => {
      setInput(text)
      inputRef.current?.focus()
      // Don't auto-send, just set the input for user to modify
    }
  }))

  return (
    <div className={`copilot-assistant ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-toggle"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Assistant' : 'Collapse Assistant'}
      >
        {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      {!isCollapsed && (
        <>
          <div className="copilot-header">
            <div className="copilot-title">
              <span className="copilot-icon">✨</span>
              <h2>Writing Assistant</h2>
            </div>
          </div>

      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`message ${message.type}`}
            >
              <div className="message-content">
                {message.type === 'assistant' && (
                  <div className="message-avatar">AI</div>
                )}
                <div className="message-body">
                  <p>{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="suggestions">
                      {message.suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="suggestion-card">
                          <div className="suggestion-header">
                            <span className="suggestion-type">{suggestion.type}</span>
                            <button
                              className="dismiss-btn"
                              onClick={() => {
                                setMessages(prev =>
                                  prev.map(msg =>
                                    msg.id === message.id
                                      ? { ...msg, suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id) }
                                      : msg
                                  )
                                )
                              }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                          <div className="suggestion-content">
                            <div className="suggestion-original">
                              <span className="label">Original:</span>
                              <span className="text">{suggestion.original}</span>
                            </div>
                            <div className="suggestion-arrow">→</div>
                            <div className="suggestion-proposed">
                              <span className="label">Suggested:</span>
                              <span className="text">{suggestion.suggested}</span>
                            </div>
                          </div>
                          {suggestion.context && (
                            <div className="suggestion-context">
                              <span className="context-label">Context:</span>
                              <span className="context-text">{suggestion.context}</span>
                            </div>
                          )}
                          {suggestion.lineNumber && (
                            <div className="suggestion-line-number">
                              <span className="line-label">Line:</span>
                              <span className="line-number">{suggestion.lineNumber}</span>
                            </div>
                          )}
                          <div className="suggestion-reason">{suggestion.reason}</div>
                          <div className="suggestion-actions">
                            <button
                              className="accept-btn"
                              onClick={() => handleApplySuggestion(suggestion, message.id)}
                            >
                              Accept
                            </button>
                            <button
                              className="dismiss-suggestion-btn"
                              onClick={() => {
                                setMessages(prev =>
                                  prev.map(msg =>
                                    msg.id === message.id
                                      ? { ...msg, suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id) }
                                      : msg
                                  )
                                )
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="message-avatar">AI</div>
              <div className="message-body">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions-container">
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.action}
              className="quick-action-btn-rounded"
              onClick={() => handleQuickAction(action.action)}
              title={action.label}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="copilot-input">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your document..."
          className="input-field"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="send-btn"
        >
          <FaPaperPlane />
        </button>
      </div>
        </>
      )}
    </div>
  )
  }
)

CopilotAssistant.displayName = 'CopilotAssistant'

export default CopilotAssistant

