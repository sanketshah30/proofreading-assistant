import { FaFolder, FaPlus, FaCloudUploadAlt, FaDownload, FaLink, FaCopy, FaSearch, FaUser, FaBook, FaLanguage, FaCreditCard, FaSignOutAlt, FaChevronUp, FaChevronDown, FaGem } from 'react-icons/fa'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
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
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-item">
              <FaFolder className="sidebar-icon" />
              <span>My Drive</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Document</span>
              <FaChevronUp className="chevron-icon" />
            </div>
            <div className="sidebar-section-items">
              <div className="sidebar-item">
                <FaPlus className="sidebar-icon" />
                <span>Start New File</span>
              </div>
              <div className="sidebar-item">
                <FaCloudUploadAlt className="sidebar-icon" />
                <div className="sidebar-item-content">
                  <span>Upload File</span>
                  <span className="sidebar-item-hint">doc, docx, txt</span>
                </div>
              </div>
              <div className="sidebar-item">
                <FaDownload className="sidebar-icon" />
                <div className="sidebar-item-content">
                  <span>Download File</span>
                  <span className="sidebar-item-hint">as.docx</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Reports</span>
              <FaChevronUp className="chevron-icon" />
            </div>
            <div className="sidebar-section-items">
              <div className="sidebar-item">
                <FaLink className="sidebar-icon" />
                <span>Citation Check</span>
              </div>
              <div className="sidebar-item">
                <FaCopy className="sidebar-icon" />
                <span>Plagiarism Check</span>
              </div>
              <div className="sidebar-item">
                <FaSearch className="sidebar-icon" />
                <span>Journal Finder</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Account</span>
              <button className="upgrade-btn">
                <FaGem className="upgrade-icon" />
                Upgrade
              </button>
            </div>
            <div className="sidebar-section-items">
              <div className="sidebar-item">
                <FaUser className="sidebar-icon" />
                <span>My Profile</span>
              </div>
              <div className="sidebar-item">
                <FaBook className="sidebar-icon" />
                <span>My Dictionary</span>
              </div>
              <div className="sidebar-item">
                <FaLanguage className="sidebar-icon" />
                <span>Language Preference</span>
              </div>
              <div className="sidebar-item">
                <FaCreditCard className="sidebar-icon" />
                <span>Subscription Details</span>
              </div>
              <div className="sidebar-item">
                <FaSignOutAlt className="sidebar-icon" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar

