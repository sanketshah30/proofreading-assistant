import { useState, useRef } from 'react'
import DocumentEditor, { DocumentEditorHandle } from './components/editor/DocumentEditor'
import CopilotAssistant from './components/copilot/CopilotAssistant'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import './App.css'

function App() {
  const [documentContent, setDocumentContent] = useState(`Blog Outline

Topic: Sports Nourishment
Target Audience: Teenagers aspiring to a career in sports
Key Points: Health concerns & nourishment needs
Summary: Overview of current training programs in the Indian sports industry, highlighting good and bad practices

1. Introduction
• Hook: A vivid anecdote or statistic about a young athlete's journey.
• Purpose: Explain why nutrition matters as much as training.
• Brief preview of what readers will learn.

2. The Landscape of Indian Sports Training
  2.1. Traditional vs. Modern Approaches
    • Historical training methods (e.g., "hard work, no rest").`)
  
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [totalAlerts, setTotalAlerts] = useState(0)
  const copilotRef = useRef<{ addToChat: (text: string) => void; draftToChat: (text: string) => void; getTotalAlerts: () => number }>(null)
  const editorRef = useRef<DocumentEditorHandle>(null)

  const handleAddToChat = (text: string) => {
    if (copilotRef.current) {
      copilotRef.current.addToChat(text)
    }
  }

  const handleTextAction = (action: string, subAction?: string, selectedText?: string) => {
    if (!selectedText) return

    let prompt = ''
    switch (action) {
      case 'rewrite':
        switch (subAction) {
          case 'improve-fluency':
            prompt = `Improve the fluency of this text: "${selectedText}"`
            break
          case 'improve-clarity':
            prompt = `Improve the clarity of this text: "${selectedText}"`
            break
          case 'make-longer':
            prompt = `Make this text longer and more detailed: "${selectedText}"`
            break
          case 'make-shorter':
            prompt = `Make this text shorter and more concise: "${selectedText}"`
            break
          case 'adjust-tone-formal':
            prompt = `Rewrite this text in a formal tone: "${selectedText}"`
            break
          case 'adjust-tone-casual':
            prompt = `Rewrite this text in a casual tone: "${selectedText}"`
            break
          case 'adjust-tone-professional':
            prompt = `Rewrite this text in a professional tone: "${selectedText}"`
            break
          case 'change-voice-formal':
            prompt = `Change the voice of this text to formal: "${selectedText}"`
            break
          case 'change-voice-casual':
            prompt = `Change the voice of this text to casual: "${selectedText}"`
            break
          case 'change-voice-professional':
            prompt = `Change the voice of this text to professional: "${selectedText}"`
            break
          case 'paraphrase-formal':
            prompt = `Paraphrase this text in a formal style: "${selectedText}"`
            break
          case 'paraphrase-casual':
            prompt = `Paraphrase this text in a casual style: "${selectedText}"`
            break
          case 'paraphrase-professional':
            prompt = `Paraphrase this text in a professional style: "${selectedText}"`
            break
          default:
            prompt = `Rewrite this text: "${selectedText}"`
        }
        break
      case 'translate':
        prompt = `Translate this text: "${selectedText}"`
        break
      case 'replace':
        prompt = `Suggest a replacement for: "${selectedText}"`
        break
      case 'insert':
        prompt = `Suggest text to insert after: "${selectedText}"`
        break
      case 'try-again':
        prompt = `Try again with: "${selectedText}"`
        break
    }

    if (prompt && copilotRef.current) {
      copilotRef.current.addToChat(prompt)
    }
  }

  return (
    <div className="app">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="app-content">
        <DocumentEditor 
          ref={editorRef}
          content={documentContent} 
          onChange={setDocumentContent}
          onAddToChat={handleAddToChat}
          onDraftToChat={(text: string) => {
            if (copilotRef.current) {
              copilotRef.current.draftToChat(text)
            }
          }}
          onTextAction={handleTextAction}
        />
        <CopilotAssistant 
          ref={copilotRef}
          documentContent={documentContent}
          isCollapsed={isCopilotCollapsed}
          onToggleCollapse={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
          onTotalAlertsChange={setTotalAlerts}
          onApplySuggestion={(suggestion, originalText, suggestedText) => {
            // Apply suggestion directly to the editor selection
            if (editorRef.current) {
              const success = editorRef.current.applySuggestion(originalText, suggestedText)
              if (!success) {
                console.warn('Failed to apply suggestion. Text may not be found in document.')
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default App

