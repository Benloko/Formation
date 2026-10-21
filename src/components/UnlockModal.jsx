import React, { useState } from 'react';
import { Key, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import './UnlockModal.css';

export function UnlockModal({ onClose, onUnlocked }) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Veuillez entrer un code d\'accès valide.');
      return;
    }

    try {
      const res = await storageService.unlockWithCodeAsync(code);
      if (res.success) {
        setSuccessInfo(res.order);
        setErrorMsg('');
        if (onUnlocked) {
          onUnlocked(res.order);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Erreur technique lors de la vérification.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card unlock-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">✕</button>

        {!successInfo ? (
          <div className="unlock-content">
            <div className="unlock-header">
              <div className="key-icon-glow">
                <Key size={30} />
              </div>
              <h3>Entrer votre Code d'Accès</h3>
              <p>
                Saisissez le code reçu lors de votre achat ou transmis par Mr Ben pour déverrouiller votre livre sur cet appareil.
              </p>
            </div>

            {errorMsg && (
              <div className="unlock-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="unlock-form">
              <div className="code-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Ex: MB-BD-8419"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="btn-primary unlock-btn">
                Déverrouiller mon Livre
              </button>
            </form>

            <div className="unlock-help-note">
              <span>Code perdu ou acheté directement sur WhatsApp ?</span>
              <a 
                href={`https://wa.me/2290199728385?text=${encodeURIComponent("Bonjour Mr Ben, j'ai besoin d'aide pour retrouver mon code d'accès.")}`}
                target="_blank" 
                rel="noreferrer"
              >
                Contactez Mr Ben en direct
              </a>
            </div>
          </div>
        ) : (
          <div className="unlock-success-content">
            <div className="success-icon-glow">
              <CheckCircle size={44} />
            </div>
            <h3>Accès Débloqué avec Succès !</h3>
            <p>
              Le livre <strong>{successInfo.itemTitle}</strong> est désormais déverrouillé et accessible en lecture intégrale.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Accéder au Livre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
