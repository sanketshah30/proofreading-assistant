import { useState, useRef, useEffect } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import './LinkDialog.css'

interface LinkDialogProps {
  position: { x: number; y: number }
  onClose: () => void
  onConfirm: (url: string, isDownloadable: boolean) => void
}

const LinkDialog = ({ position, onClose, onConfirm }: LinkDialogProps) => {
  const [url, setUrl] = useState('')
  const [isDownloadable, setIsDownloadable] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onConfirm(url.trim(), isDownloadable)
      onClose()
    }
  }

  return (
    <div 
      ref={dialogRef}
      className="link-dialog"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="link-dialog-field">
          <label htmlFor="link-url">Link URL</label>
          <input
            ref={inputRef}
            id="link-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="link-input"
          />
        </div>
        <div className="link-dialog-field">
          <label htmlFor="downloadable" className="toggle-label">
            <span>Downloadable</span>
            <div className="toggle-switch">
              <input
                id="downloadable"
                type="checkbox"
                checked={isDownloadable}
                onChange={(e) => setIsDownloadable(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>
        <div className="link-dialog-actions">
          <button type="submit" className="link-confirm-btn">
            <FaCheck />
          </button>
          <button type="button" onClick={onClose} className="link-cancel-btn">
            <FaTimes />
          </button>
        </div>
      </form>
    </div>
  )
}

export default LinkDialog

