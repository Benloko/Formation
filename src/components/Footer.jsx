import React from 'react';
import { MessageCircle, Shield, Key } from 'lucide-react';
import { CREATOR_PROFILE } from '../data/servicesData';
import './Footer.css';

export function Footer({ onOpenAdmin, onOpenUnlockModal }) {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">MB</div>
          <div>
            <span className="footer-name">{CREATOR_PROFILE.name}</span>
            <p className="footer-tagline">{CREATOR_PROFILE.tagline}</p>
          </div>
        </div>

        <div className="footer-links">
          <a 
            href={`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${encodeURIComponent("Bonjour Mr Ben !")}`} 
            target="_blank" 
            rel="noreferrer"
            className="footer-link"
          >
            <MessageCircle size={15} />
            <span>WhatsApp Officiel</span>
          </a>

          <button className="footer-link-btn" onClick={onOpenUnlockModal}>
            <Key size={15} />
            <span>Débloquer avec un code</span>
          </button>

          <button className="footer-link-btn admin-btn" onClick={onOpenAdmin}>
            <Shield size={14} />
            <span>Administration</span>
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 {CREATOR_PROFILE.name} — Tous droits réservés. Lecture 100% en ligne sécurisée.</p>
      </div>
    </footer>
  );
}
