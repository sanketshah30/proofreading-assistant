import { FaDownload, FaCertificate, FaBars } from 'react-icons/fa'
import './Header.css'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-dots">
            <span className="dot dot-orange"></span>
            <span className="dot dot-pink"></span>
            <span className="dot dot-purple"></span>
          </div>
          <div className="logo">
            <span className="logo-text">TRINKA</span>
            <button className="logo-badge">Basic</button>
          </div>
        </div>
        <button className="hamburger-menu" onClick={onToggleSidebar}>
          <FaBars />
        </button>
      </div>
      <div className="header-center">
        <div className="document-info">
          <span className="document-title">My Document 10-Dec-2025</span>
          <div className="document-meta">
            <span className="language-badge">EN (US)</span>
            <button className="download-btn">
              <FaDownload /> Download
            </button>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="certificate-section">
          <FaCertificate />
          <span>Certificate of Editing</span>
          <button className="get-certificate-btn">Get Now</button>
          <span className="new-badge">New</span>
        </div>
      </div>
    </header>
  )
}

export default Header

