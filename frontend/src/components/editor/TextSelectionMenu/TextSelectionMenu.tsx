import { useState, useEffect, useRef } from 'react'
import { FaMagic, FaLanguage, FaChevronRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import './TextSelectionMenu.css'

interface TextSelectionMenuProps {
  selectedText: string
  position: { x: number; y: number }
  onClose: () => void
  onAction: (action: string, subAction?: string) => void
  onAddToChat: () => void
  onDraftToChat?: (text: string) => void
}

const TextSelectionMenu = ({ selectedText, position, onClose, onAction, onAddToChat, onDraftToChat }: TextSelectionMenuProps) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Don't close if clicking on toolbar or its dropdowns
        const target = event.target as HTMLElement
        if (target.closest('.editor-toolbar') || target.closest('.font-dropdown') || target.closest('.toolbar-select')) {
          return
        }
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Use a slight delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    document.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const rewriteOptions = [
    { id: 'improve-fluency', label: 'Improve Fluency' },
    { id: 'improve-clarity', label: 'Improve Clarity' },
    { id: 'make-longer', label: 'Make it Longer' },
    { id: 'make-shorter', label: 'Make it Shorter' },
    { id: 'adjust-tone', label: 'Adjust Tone', hasSubmenu: true },
    { id: 'change-voice', label: 'Change Voice', hasSubmenu: true },
    { id: 'paraphrase', label: 'Paraphrase', hasSubmenu: true },
  ]

  const handleRewriteAction = (actionId: string) => {
    if (onDraftToChat) {
      // Draft to chat instead of executing
      let prompt = ''
      switch (actionId) {
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
        case 'adjust-tone-persuasive':
          prompt = `Rewrite this text in a persuasive tone: "${selectedText}"`
          break
        case 'adjust-tone-authoritative':
          prompt = `Rewrite this text in an authoritative tone: "${selectedText}"`
          break
        case 'adjust-tone-neutral':
          prompt = `Rewrite this text in a neutral tone: "${selectedText}"`
          break
        case 'adjust-tone-formal':
          prompt = `Rewrite this text in a formal tone: "${selectedText}"`
          break
        case 'change-voice-active':
          prompt = `Change this text to active voice: "${selectedText}"`
          break
        case 'change-voice-passive':
          prompt = `Change this text to passive voice: "${selectedText}"`
          break
        case 'paraphrase-standard':
          prompt = `Paraphrase this text in a standard style: "${selectedText}"`
          break
        case 'paraphrase-academic':
          prompt = `Paraphrase this text in an academic style: "${selectedText}"`
          break
        case 'paraphrase-formal':
          prompt = `Paraphrase this text in a formal style: "${selectedText}"`
          break
        case 'paraphrase-casual':
          prompt = `Paraphrase this text in a casual style: "${selectedText}"`
          break
        case 'paraphrase-simple':
          prompt = `Paraphrase this text in a simple style: "${selectedText}"`
          break
        default:
          prompt = `Rewrite this text: "${selectedText}"`
      }
      onDraftToChat(prompt)
    } else {
      onAction('rewrite', actionId)
    }
    onClose()
  }

  const handleTranslate = (language?: string) => {
    if (onDraftToChat) {
      if (language) {
        onDraftToChat(`Translate this text to ${language}: "${selectedText}"`)
      } else {
        onDraftToChat(`Translate this text: "${selectedText}"`)
      }
    } else {
      onAction('translate')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="text-selection-menu"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        <div className="selection-menu-header">
          <div className="add-to-chat-option" onClick={() => {
            if (onDraftToChat) {
              onDraftToChat(`What should I do with this text: "${selectedText}"`)
            } else {
              onAddToChat()
            }
            onClose()
          }}>
            <FaMagic className="magic-icon" />
            <div className="add-to-chat-content">
              <div className="add-to-chat-text">Ask Trinka what to do next</div>
              <div className="add-to-chat-hint">(eg. Improve fluency)</div>
            </div>
            <div className="keyboard-shortcut">Ctrl+L</div>
          </div>
        </div>

        <div className="selection-menu-divider"></div>

        <div className="selection-menu-section">
          <div className="section-header">
            <span className="section-title">Rewrite</span>
            <span className="section-badge labs">▲ Labs</span>
          </div>
          <div className="menu-options">
            {rewriteOptions.map((option) => (
              <div
                key={option.id}
                className="menu-option"
                onClick={() => !option.hasSubmenu && handleRewriteAction(option.id)}
                onMouseEnter={() => option.hasSubmenu && setHoveredSubmenu(option.id)}
                onMouseLeave={() => setHoveredSubmenu(null)}
              >
                <FaMagic className="option-icon" />
                <span>{option.label}</span>
                {option.hasSubmenu && (
                  <>
                    <FaChevronRight className="chevron-icon" />
                    {hoveredSubmenu === option.id && (
                      <div className="submenu">
                        {option.id === 'change-voice' && (
                          <>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-active`)}>
                              Active
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-passive`)}>
                              Passive
                            </div>
                          </>
                        )}
                        {option.id === 'adjust-tone' && (
                          <>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-persuasive`)}>
                              Persuasive
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-authoritative`)}>
                              Authoritative
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-neutral`)}>
                              Neutral
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-formal`)}>
                              Formal
                            </div>
                          </>
                        )}
                        {option.id === 'paraphrase' && (
                          <>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-standard`)}>
                              Standard
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-academic`)}>
                              Academic
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-formal`)}>
                              Formal
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-casual`)}>
                              Casual
                            </div>
                            <div className="submenu-option" onClick={() => handleRewriteAction(`${option.id}-simple`)}>
                              Simple
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="selection-menu-divider"></div>

        <div className="selection-menu-section">
          <div className="section-header">
            <span className="section-title">Translate</span>
            <span className="section-badge new">New</span>
          </div>
          <div className="menu-options">
            <div 
              className="menu-option" 
              onMouseEnter={() => setHoveredSubmenu('translate')}
              onMouseLeave={() => setHoveredSubmenu(null)}
            >
              <FaLanguage className="option-icon" />
              <span>Translate</span>
              <FaChevronRight className="chevron-icon" />
              {hoveredSubmenu === 'translate' && (
                <div className="submenu">
                  <div className="submenu-option" onClick={() => handleTranslate('English (US)')}>
                    English (US)
                  </div>
                  <div className="submenu-option" onClick={() => handleTranslate('English (UK)')}>
                    English (UK)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TextSelectionMenu

