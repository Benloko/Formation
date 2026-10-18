import React, { useState } from 'react';
import { Sparkles, MessageCircle, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { LAUNCH_BONUS, CREATOR_PROFILE } from '../data/servicesData';
import './BonusModal.css';

export function BonusModal({ onClose, activeCode }) {
  const [pageUrl, setPageUrl] = useState('');
  const [studentName, setStudentName] = useState('');

  const handleSendToWhatsApp = (e) => {
    e.preventDefault();

    const codeInfo = activeCode ? `(Mon Code Élève : ${activeCode})` : `(Code d'accès conservé)`;
    const namePart = studentName.trim() ? `Je m'appelle ${studentName.trim()}` : `Je suis élève de votre formation`;
    const pagePart = pageUrl.trim() ? `Voici le lien de ma page à booster : ${pageUrl.trim()}` : `Voici le lien de ma page ci-joint.`;

    const message = `Bonjour Mr Ben ! 
${namePart} ${codeInfo}.
J'ai terminé mon premier épisode et je souhaite réclamer mon Super Bonus de Lancement.
${pagePart}

Merci pour votre coup de pouce pour ma visibilité !`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bonus-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">✕</button>

        <div className="bonus-modal-content">
          <div className="bonus-modal-header">
            <div className="bonus-icon-glow">
              <Sparkles size={32} />
            </div>
            <span className="badge-tag">{LAUNCH_BONUS.badge}</span>
            <h3>{LAUNCH_BONUS.title}</h3>
            <p className="bonus-lead">
              {LAUNCH_BONUS.description}
            </p>
          </div>

          {/* Étapes du Bonus */}
          <div className="bonus-steps-card">
            <h4>Comment en profiter ?</h4>
            <div className="steps-list">
              {LAUNCH_BONUS.steps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <span className="step-badge">{idx + 1}</span>
                  <span className="step-label">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire de redirection WhatsApp */}
          <form onSubmit={handleSendToWhatsApp} className="bonus-form">
            <div className="form-group">
              <label>Votre Nom ou Pseudo</label>
              <input 
                type="text" 
                placeholder="Ex: Christian M."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Lien de votre Page Facebook ou Compte TikTok</label>
              <input 
                type="url" 
                placeholder="https://facebook.com/votrepage ou TikTok"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="bonus-whatsapp-submit-btn">
              <MessageCircle size={18} />
              <span>Envoyer ma page à Mr Ben sur WhatsApp</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="bonus-note">
            Mr Ben consultera directement votre premier épisode et le partagera auprès de sa communauté active.
          </p>
        </div>
      </div>
    </div>
  );
}
