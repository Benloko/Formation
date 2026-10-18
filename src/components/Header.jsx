import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, BookOpen, CheckCircle2, Shield } from 'lucide-react';
import { storageService } from '../services/storageService';
import './Header.css';

export function Header({ activeTab, onSelectTab, onOpenAbout, onOpenAdmin }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const userEmail = storageService.getLoggedInGmail();
  const accounts = storageService.getGoogleAccounts();
  const currentAccount = accounts.find(a => a.email.toLowerCase() === userEmail?.toLowerCase()) || (userEmail ? { email: userEmail, name: userEmail.split('@')[0], avatar: userEmail[0].toUpperCase() } : null);

  // Fermer le menu déroulant si on clique en dehors ("dans le vide") ou sur Échap
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  const navItems = [
    { id: 'HOME', label: 'HOME' },
    { id: 'FORMATIONS', label: 'NOS FORMATIONS' },
    { id: 'SERVICES', label: 'NOS SERVICES' },
    { id: 'CONTACT', label: 'CONTACT' }
  ];

  const handleDisconnect = () => {
    storageService.logout();
    setShowProfileMenu(false);
    window.location.reload();
  };

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    onSelectTab('HOME');
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        if (onOpenAdmin) onOpenAdmin();
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClicks(0), 1200);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Beau logo en rond au style MR (avec accès secret admin en triple-clic) */}
        <div className="logo-brand" onClick={handleLogoClick} title="Mr Ben">
          <div className="logo-circle-wrapper">
            <img 
              src="/mr-logo.png" 
              alt="MR Logo" 
              className="logo-mr-img"
            />
          </div>
        </div>

        {/* Menu de navigation animé */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                <span className="nav-btn-text">{item.label}</span>
                <span className="nav-underline"></span>
              </button>
            );
          })}
        </nav>

        {/* Profil utilisateur connecté */}
        <div className="header-right">
          {currentAccount ? (
            <div className="header-profile-container" ref={profileMenuRef}>
              <button 
                type="button"
                className="header-user-avatar-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={`Profil : ${currentAccount.name || currentAccount.email}`}
                aria-label="Mon compte"
              >
                <div className="header-avatar-circle">
                  {currentAccount.avatar || currentAccount.email[0].toUpperCase()}
                </div>
              </button>

              {/* Menu déroulant du profil utilisateur */}
              {showProfileMenu && (
                <div className="header-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-user-header">
                    <div className="dropdown-avatar-big">
                      {currentAccount.avatar || currentAccount.email[0].toUpperCase()}
                    </div>
                    <div className="dropdown-user-text">
                      <span className="dropdown-user-fullname">{currentAccount.name || currentAccount.email.split('@')[0]}</span>
                      <span className="dropdown-email">{currentAccount.email}</span>
                      <span className="dropdown-status-badge">
                        <CheckCircle2 size={12} />
                        <span>Compte Google actif</span>
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button 
                    type="button" 
                    className="dropdown-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab('FORMATIONS');
                    }}
                  >
                    <BookOpen size={15} />
                    <span>Mes formations</span>
                  </button>

                  <button 
                    type="button" 
                    className="dropdown-menu-item text-danger"
                    onClick={handleDisconnect}
                  >
                    <LogOut size={15} />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="about-icon-btn" 
              onClick={onOpenAbout}
              title="Profil / À Propos"
              aria-label="Profil"
            >
              <User size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
