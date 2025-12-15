import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { 
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaLink, FaImage, FaTable, FaChevronDown
} from 'react-icons/fa'
import TextSelectionMenu from '../TextSelectionMenu'
import LinkDialog from '../LinkDialog'
import './DocumentEditor.css'

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  onAddToChat?: (text: string) => void
  onDraftToChat?: (text: string) => void
  onTextAction?: (action: string, subAction?: string, selectedText?: string) => void
}

export interface DocumentEditorHandle {
  applySuggestion: (originalText: string, suggestedText: string) => boolean
}

const DocumentEditor = forwardRef<DocumentEditorHandle, DocumentEditorProps>(
  ({ content, onChange, onAddToChat, onDraftToChat, onTextAction }, ref: React.ForwardedRef<DocumentEditorHandle>) => {
  const [wordCount, setWordCount] = useState(563)
  const [selectedText, setSelectedText] = useState('')
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [showMenuIcon, setShowMenuIcon] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkDialogPosition, setLinkDialogPosition] = useState({ x: 0, y: 0 })
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)
  const lastContentRef = useRef(content)
  const savedSelectionRef = useRef<Range | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      editorRef.current.textContent = content
      lastContentRef.current = content
      setWordCount(content.split(/\s+/).filter(word => word.length > 0).length)
    }
  }, [])

  // Only update content if it changed from outside (e.g., from suggestions)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current && lastContentRef.current !== content) {
      const currentText = editorRef.current.textContent || ''
      if (currentText !== content) {
        // Save cursor position
        const selection = window.getSelection()
        let savedOffset = 0
        let savedNode: Node | null = null
        
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          savedNode = range.startContainer
          savedOffset = range.startOffset
        }

        // Update content
        editorRef.current.textContent = content
        lastContentRef.current = content

        // Restore cursor position
        if (savedNode && editorRef.current.contains(savedNode)) {
          try {
            const newRange = document.createRange()
            const textNode = editorRef.current.firstChild
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              const maxOffset = Math.min(savedOffset, textNode.textContent?.length || 0)
              newRange.setStart(textNode, maxOffset)
              newRange.setEnd(textNode, maxOffset)
              selection?.removeAllRanges()
              selection?.addRange(newRange)
            }
          } catch (e) {
            // If cursor restoration fails, set cursor to end
            const range = document.createRange()
            range.selectNodeContents(editorRef.current)
            range.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        } else {
          // Set cursor to end if we can't restore
          const range = document.createRange()
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }
    }
    isInternalChange.current = false
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true
      const text = editorRef.current.textContent || ''
      lastContentRef.current = text
      onChange(text)
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
    }
  }

  const handleSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim()
      setSelectedText(text)

      // Save selection for later restoration
      const range = selection.getRangeAt(0)
      savedSelectionRef.current = range.cloneRange()

      // Get position for menu icon (bottom left of selection)
      const rect = range.getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()

      if (editorRect && editorRef.current) {
        // Calculate position relative to editor content wrapper
        const wrapper = editorRef.current.parentElement
        const wrapperRect = wrapper?.getBoundingClientRect()
        
        if (wrapperRect) {
          // Position icon at bottom left of selection
          setMenuPosition({
            x: rect.left - wrapperRect.left,
            y: rect.bottom - wrapperRect.top + 4
          })
          setShowMenuIcon(true)
          setShowMenu(false) // Don't show full menu initially
        }
      }
    } else {
      setShowMenu(false)
      setShowMenuIcon(false)
      setSelectedText('')
      savedSelectionRef.current = null
    }
  }

  const handleAddToChat = () => {
    if (selectedText && onAddToChat) {
      onAddToChat(selectedText)
      setShowMenu(false)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleTextAction = (action: string, subAction?: string) => {
    if (onTextAction) {
      onTextAction(action, subAction, selectedText)
    }
    setShowMenu(false)
    window.getSelection()?.removeAllRanges()
  }

  // Method to apply suggestion text to current selection
  const applySuggestionToSelection = (originalText: string, suggestedText: string) => {
    if (!editorRef.current) return false

    const selection = window.getSelection()
    let rangeToUse: Range | null = null

    // Always search for the original text in the document first
    // This ensures we replace the correct text regardless of cursor position
    const documentText = editorRef.current.textContent || ''
    let searchIndex = 0
    let foundIndex = -1
    
    // Try to find the text, starting from the beginning
    while ((foundIndex = documentText.indexOf(originalText, searchIndex)) !== -1) {
      // Create a range for the found text
      const range = document.createRange()
      let charCount = 0
      let found = false

      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      )

      let textNode
      while (textNode = walker.nextNode()) {
        const text = textNode.textContent || ''
        if (charCount + text.length > foundIndex) {
          const offset = foundIndex - charCount
          if (offset >= 0 && offset + originalText.length <= text.length) {
            // Verify this is the exact match
            const textAtOffset = text.substring(offset, offset + originalText.length)
            if (textAtOffset === originalText) {
              range.setStart(textNode, offset)
              range.setEnd(textNode, offset + originalText.length)
              found = true
              break
            }
          }
        }
        charCount += text.length
      }

      if (found) {
        rangeToUse = range
        break
      }
      
      // Try next occurrence
      searchIndex = foundIndex + 1
    }

    // Fallback: If text not found, try to use saved selection or current selection
    // This handles edge cases where the text might have been modified
    if (!rangeToUse) {
      if (savedSelectionRef.current) {
        // Verify the saved selection still contains the original text
        const savedText = savedSelectionRef.current.toString()
        if (savedText === originalText) {
          rangeToUse = savedSelectionRef.current
        }
      } else if (selection && selection.rangeCount > 0) {
        const currentRange = selection.getRangeAt(0)
        if (editorRef.current.contains(currentRange.commonAncestorContainer)) {
          const currentText = currentRange.toString()
          if (currentText === originalText) {
            rangeToUse = currentRange
          }
        }
      }
    }

    if (rangeToUse && selection) {
      try {
        editorRef.current.focus()
        selection.removeAllRanges()
        selection.addRange(rangeToUse)

        // Delete the selected content
        rangeToUse.deleteContents()

        // Insert the suggested text
        const textNode = document.createTextNode(suggestedText)
        rangeToUse.insertNode(textNode)

        // Move cursor to end of inserted text
        rangeToUse.setStartAfter(textNode)
        rangeToUse.collapse(true)
        selection.removeAllRanges()
        selection.addRange(rangeToUse)

        // Update content
        const text = editorRef.current.textContent || ''
        isInternalChange.current = true
        onChange(text)
        lastContentRef.current = text
        setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)

        return true
      } catch (err) {
        console.error('Error applying suggestion:', err)
        return false
      }
    }

    return false
  }

  // Expose applySuggestion method via ref
  useImperativeHandle(ref, () => ({
    applySuggestion: applySuggestionToSelection
  }))

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+L for Add to Chat
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        const selection = window.getSelection()
        const text = selection?.toString().trim() || ''
        if (text && onAddToChat) {
          onAddToChat(text)
          selection?.removeAllRanges()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onAddToChat])

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false)
      }
    }

    if (showFontDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFontDropdown])

  // Save selection when clicking toolbar buttons
  const saveSelection = (e?: React.MouseEvent) => {
    // Don't prevent default for select elements - they need to open normally
    if (e) {
      const target = e.target as HTMLElement
      if (target.tagName === 'SELECT' || target.closest('select')) {
        // Allow select to work normally, just save selection without preventing default
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0 && editorRef.current) {
          const range = selection.getRangeAt(0)
          if (editorRef.current.contains(range.commonAncestorContainer)) {
            savedSelectionRef.current = range.cloneRange()
          }
        }
        return
      }
      e.preventDefault()
      e.stopPropagation()
    }
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0)
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange()
      }
    } else if (editorRef.current && savedSelectionRef.current) {
      // If no current selection but we have a saved one, try to restore it
      const selection = window.getSelection()
      if (selection && savedSelectionRef.current) {
        try {
          selection.removeAllRanges()
          selection.addRange(savedSelectionRef.current)
        } catch (err) {
          // Ignore errors
        }
      }
    }
  }
  
  const execCommand = (command: string, value?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!editorRef.current) return
    
    // Use saved selection or try to get current one
    let rangeToUse = savedSelectionRef.current
    const selection = window.getSelection()
    
    // If no saved selection, try current
    if (!rangeToUse && selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0)
      if (editorRef.current.contains(currentRange.commonAncestorContainer)) {
        rangeToUse = currentRange.cloneRange()
      }
    }
    
    // Focus the editor
    editorRef.current.focus()
    
    // Restore selection
    if (rangeToUse && selection) {
      try {
        selection.removeAllRanges()
        selection.addRange(rangeToUse)
      } catch (err) {
        // Continue without selection if restoration fails
      }
    }
    
    // Execute the command
    try {
      let success = false
      
      if (command === 'createLink') {
        // Link dialog is shown on hover, so we don't need to handle it here
        return
      } else if (command === 'insertImage') {
        // Trigger file picker
        fileInputRef.current?.click()
        return // Don't execute command yet, wait for file selection
      } else {
        success = document.execCommand(command, false, value)
      }
      
      if (success && editorRef.current) {
        // Update content after command
        const text = editorRef.current.textContent || ''
        isInternalChange.current = true
        onChange(text)
        lastContentRef.current = text
        setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
      }
    } catch (err) {
      console.error('Error executing command:', err)
    }
    
    // Clear saved selection
    savedSelectionRef.current = null
    
    // Keep focus on editor
    editorRef.current?.focus()
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        if (imageUrl && editorRef.current) {
          editorRef.current.focus()
          const success = document.execCommand('insertImage', false, imageUrl)
          if (success) {
            const text = editorRef.current.textContent || ''
            isInternalChange.current = true
            onChange(text)
            lastContentRef.current = text
          }
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLinkConfirm = (url: string, isDownloadable: boolean) => {
    if (url && editorRef.current) {
      // Restore selection first
      const selection = window.getSelection()
      if (savedSelectionRef.current && selection) {
        try {
          editorRef.current.focus()
          selection.removeAllRanges()
          selection.addRange(savedSelectionRef.current)
        } catch (err) {
          // Continue without selection
        }
      }
      
      // Small delay to ensure selection is restored
      setTimeout(() => {
        if (editorRef.current) {
          const selection = window.getSelection()
          if (savedSelectionRef.current && selection) {
            try {
              selection.removeAllRanges()
              selection.addRange(savedSelectionRef.current)
            } catch (err) {
              // Continue without selection
            }
          }
          
          const success = document.execCommand('createLink', false, url)
          if (success) {
            const text = editorRef.current.textContent || ''
            isInternalChange.current = true
            onChange(text)
            lastContentRef.current = text
            
            // If downloadable, add download attribute
            if (isDownloadable) {
              const links = editorRef.current.querySelectorAll('a')
              const lastLink = links[links.length - 1]
              if (lastLink) {
                lastLink.setAttribute('download', '')
              }
            }
          }
          savedSelectionRef.current = null
        }
      }, 10)
    }
  }

  const handleFontChange = (fontFamily: string) => {
    if (editorRef.current) {
      // Restore selection first
      const selection = window.getSelection()
      if (savedSelectionRef.current && selection) {
        try {
          editorRef.current.focus()
          selection.removeAllRanges()
          selection.addRange(savedSelectionRef.current)
        } catch (err) {
          // Continue without selection
        }
      }
      
      // Small delay to ensure selection is restored
      setTimeout(() => {
        if (editorRef.current) {
          const selection = window.getSelection()
          if (savedSelectionRef.current && selection) {
            try {
              selection.removeAllRanges()
              selection.addRange(savedSelectionRef.current)
            } catch (err) {
              // Continue without selection
            }
          }
          
          const success = document.execCommand('fontName', false, fontFamily)
          if (success) {
            const text = editorRef.current.textContent || ''
            isInternalChange.current = true
            onChange(text)
            lastContentRef.current = text
          }
          savedSelectionRef.current = null
        }
      }, 10)
      
      setShowFontDropdown(false)
    }
  }

  const handleParagraphChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (editorRef.current) {
      editorRef.current.focus()
      
      // Save selection
      const selection = window.getSelection()
      let range: Range | null = null
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0).cloneRange()
      }
      
      // Apply heading format
      if (value === 'Heading 1') {
        document.execCommand('formatBlock', false, '<h1>')
      } else if (value === 'Heading 2') {
        document.execCommand('formatBlock', false, '<h2>')
      } else if (value === 'Heading 3') {
        document.execCommand('formatBlock', false, '<h3>')
      } else {
        document.execCommand('formatBlock', false, '<p>')
      }
      
      // Restore selection
      if (range) {
        try {
          selection?.removeAllRanges()
          selection?.addRange(range)
        } catch (err) {
          // Ignore
        }
      }
      
      // Update content
      if (editorRef.current) {
        const text = editorRef.current.textContent || ''
        isInternalChange.current = true
        onChange(text)
        lastContentRef.current = text
      }
      
      editorRef.current.focus()
    }
  }

  return (
    <div className="document-editor">
      <div className="editor-toolbar" onMouseDown={(e) => {
        // Save selection when clicking anywhere on toolbar
        // But allow select elements to work normally
        const target = e.target as HTMLElement
        if (target.tagName !== 'SELECT' && !target.closest('select')) {
          saveSelection(e)
        }
      }}>
        <select 
          className="toolbar-select" 
          onChange={handleParagraphChange}
        >
          <option>Paragraph</option>
          <option>Heading 1</option>
          <option>Heading 2</option>
          <option>Heading 3</option>
        </select>
        <div className="font-selector-wrapper" ref={fontDropdownRef}>
          <button 
            onMouseDown={(e) => {
              saveSelection(e)
            }} 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowFontDropdown(!showFontDropdown)
            }} 
            className="toolbar-btn font-btn" 
            type="button"
          >
            <span>A</span>
            <FaChevronDown className="font-chevron" />
          </button>
          {showFontDropdown && (
            <div className="font-dropdown">
              <div className="font-option" style={{ fontFamily: 'Arial' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Arial')}>Arial</div>
              <div className="font-option" style={{ fontFamily: 'Helvetica' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Helvetica')}>Helvetica</div>
              <div className="font-option" style={{ fontFamily: 'Times New Roman' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Times New Roman')}>Times New Roman</div>
              <div className="font-option" style={{ fontFamily: 'Georgia' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Georgia')}>Georgia</div>
              <div className="font-option" style={{ fontFamily: 'Verdana' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Verdana')}>Verdana</div>
              <div className="font-option" style={{ fontFamily: 'Courier New' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Courier New')}>Courier New</div>
              <div className="font-option" style={{ fontFamily: 'Comic Sans MS' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Comic Sans MS')}>Comic Sans MS</div>
              <div className="font-option" style={{ fontFamily: 'Impact' }} onMouseDown={(e) => { e.preventDefault(); saveSelection(e); }} onClick={() => handleFontChange('Impact')}>Impact</div>
            </div>
          )}
        </div>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('bold', undefined, e)} className="toolbar-btn" type="button">
          <FaBold />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('italic', undefined, e)} className="toolbar-btn" type="button">
          <FaItalic />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('underline', undefined, e)} className="toolbar-btn" type="button">
          <FaUnderline />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('strikeThrough', undefined, e)} className="toolbar-btn" type="button">
          <FaStrikethrough />
        </button>
        <div className="toolbar-divider"></div>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('insertUnorderedList', undefined, e)} className="toolbar-btn" type="button">
          <FaListUl />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('insertOrderedList', undefined, e)} className="toolbar-btn" type="button">
          <FaListOl />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('justifyLeft', undefined, e)} className="toolbar-btn" type="button">
          <FaAlignLeft />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('justifyCenter', undefined, e)} className="toolbar-btn" type="button">
          <FaAlignCenter />
        </button>
        <button onMouseDown={(e) => saveSelection(e)} onClick={(e) => execCommand('justifyRight', undefined, e)} className="toolbar-btn" type="button">
          <FaAlignRight />
        </button>
        <div className="toolbar-divider"></div>
        <div 
          className="link-button-wrapper"
          onMouseEnter={(e) => {
            saveSelection() // Save selection before showing dialog
            const wrapper = e.currentTarget
            const buttonRect = wrapper.getBoundingClientRect()
            setLinkDialogPosition({
              x: buttonRect.left + buttonRect.width / 2,
              y: buttonRect.bottom
            })
            setShowLinkDialog(true)
          }}
          onMouseLeave={(e) => {
            // Check if mouse is moving to dialog
            const relatedTarget = e.relatedTarget as HTMLElement
            if (!relatedTarget?.closest('.link-dialog') && !relatedTarget?.closest('.link-button-wrapper')) {
              setTimeout(() => {
                if (!document.querySelector('.link-dialog:hover')) {
                  setShowLinkDialog(false)
                }
              }, 200)
            }
          }}
        >
          <button 
            onMouseDown={(e) => {
              saveSelection(e)
            }} 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="toolbar-btn" 
            type="button"
          >
            <FaLink />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button onMouseDown={saveSelection} onClick={(e) => execCommand('insertImage', undefined, e)} className="toolbar-btn" type="button">
          <FaImage />
        </button>
        <button className="toolbar-btn" type="button" title="Table (Coming soon)">
          <FaTable />
        </button>
      </div>
      <div className="editor-content-wrapper">
        <div 
          ref={editorRef}
          className="editor-content"
          contentEditable
          onInput={handleInput}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          onBlur={() => {
            // Save selection when editor loses focus
            saveSelection()
          }}
          onMouseDown={(e) => {
            // Prevent losing selection when clicking in editor
            if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
              return
            }
          }}
          suppressContentEditableWarning
        />
        {showMenuIcon && selectedText && !showMenu && (
          <div
            className="text-selection-icon"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Preserve selection before opening menu
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                savedSelectionRef.current = selection.getRangeAt(0).cloneRange()
              }
              setShowMenu(true)
              setShowMenuIcon(false)
            }}
            onMouseEnter={() => {
              // Keep selection highlighted when hovering icon
              const selection = window.getSelection()
              if (selection && selection.rangeCount === 0 && savedSelectionRef.current) {
                try {
                  selection.removeAllRanges()
                  selection.addRange(savedSelectionRef.current)
                } catch (err) {
                  // Ignore
                }
              }
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="5" fill="#6c5ce7"/>
              <path d="M12 6L14.5 10L12 14L9.5 10L12 6Z" fill="white" stroke="white" strokeWidth="0.5"/>
              <path d="M8 16L10 18L12 16L14 18L16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <circle cx="10" cy="19" r="1" fill="white"/>
              <circle cx="14" cy="19" r="1" fill="white"/>
            </svg>
          </div>
        )}
        {showMenu && selectedText && (
          <TextSelectionMenu
            selectedText={selectedText}
            position={menuPosition}
            onClose={() => {
              setShowMenu(false)
              setShowMenuIcon(false)
              window.getSelection()?.removeAllRanges()
            }}
            onAction={handleTextAction}
            onAddToChat={handleAddToChat}
            onDraftToChat={onDraftToChat}
          />
        )}
        {showLinkDialog && (
          <LinkDialog
            position={linkDialogPosition}
            onClose={() => setShowLinkDialog(false)}
            onConfirm={handleLinkConfirm}
          />
        )}
      </div>
      <div className="editor-footer">
        <span>Word Count: {wordCount}</span>
        <span className="ai-hint">Type '/ask' for AI commands</span>
        <div className="save-status">
          <span>Saved</span>
        </div>
      </div>
    </div>
  )
})

DocumentEditor.displayName = 'DocumentEditor'

export default DocumentEditor

