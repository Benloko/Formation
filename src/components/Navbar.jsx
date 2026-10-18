import React from 'react';
import { BookOpen, Key, Sparkles, MessageCircle, Shield } from 'lucide-react';
import './Navbar.css';
import { CREATOR_PROFILE } from '../data/servicesData';

export function Navbar({ onOpenUnlockModal, onOpenAdmin, activeSection, onNavigate }) {
  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent("Bonjour Mr Ben, j'aimerais échanger avec vous concernant vos formations et services.");
    window.open(`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Logo Mr Ben sobre */}
        <div className="navbar-brand" onClick={() => onNavigate('books')}>
          <div className="brand-avatar">MB</div>
          <div className="brand-info">
            <span className="brand-name">{CREATOR_PROFILE.name}</span>
            <span className="brand-badge">Storytelling & Dev</span>
          </div>
        </div>

        {/* Liens de navigation épurés et discrets */}
        <nav className="navbar-links">
          <button 
            className={`nav-link ${activeSection === 'books' ? 'active' : ''}`}
            onClick={() => onNavigate('books')}
          >
            <BookOpen size={14} />
            <span>Formations</span>
          </button>

          <button 
            className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
            onClick={() => onNavigate('services')}
          >
            <Sparkles size={14} />
            <span>Services</span>
          </button>

          <button 
            className="nav-link unlock-link"
            onClick={onOpenUnlockModal}
            title="Saisir votre code d'accès"
          >
            <Key size={13} />
            <span>Entrer mon code</span>
          </button>
        </nav>

        {/* Actions à droite */}
        <div className="navbar-actions">
          <button className="nav-admin-btn" onClick={onOpenAdmin} title="Administration">
            <Shield size={13} />
            <span>Admin</span>
          </button>

          <button className="navbar-whatsapp-btn" onClick={handleWhatsAppDirect}>
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
}
