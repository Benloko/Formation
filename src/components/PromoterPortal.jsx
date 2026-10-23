import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Tag, 
  Copy, 
  Check, 
  Share2, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Globe,
  Sparkles,
  Award,
  AlertCircle,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';
import './PromoterPortal.css';

export function PromoterPortal({ onClose, promoterIdParam }) {
  // Détection du promoteur ciblé via l'URL (?id=..., ?code=..., ou ?promo=...)
  const getInitialPromoter = () => {
    try {
      const hash = window.location.hash || '';
      let id = promoterIdParam || '';
      let code = '';

      // 1. Depuis window.location.search (?code=... ou ?id=...)
      if (typeof window !== 'undefined' && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        id = searchParams.get('id') || id;
        code = searchParams.get('code') || searchParams.get('promo') || code;
      }

      // 2. Depuis window.location.hash (#promoteur?code=... ou #promoteur?id=...)
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        id = params.get('id') || id;
        code = params.get('code') || params.get('promo') || code;
      }

      if (id) {
        const p = storageService.getPromoterById(id);
        if (p) return p;
      }
      if (code) {
        const p = storageService.getPromoterByCode(code);
        if (p) return p;
      }

      // Si aucun paramètre, récupérer le premier promoteur actif
      const all = storageService.getAllPromoters();
      return all.length > 0 ? all[0] : null;
    } catch {
      return null;
    }
  };

  const [promoter, setPromoter] = useState(() => getInitialPromoter());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (!promoter?.id) return false;
      return sessionStorage.getItem(`mrben_promoter_session_${promoter.id}`) === 'active';
    } catch {
      return false;
    }
  });

  // États pour la création du mot de passe (1ère connexion)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [setupError, setSetupError] = useState('');

  // États pour la connexion ultérieure
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // États d'action
  const [copiedItem, setCopiedItem] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Synchronisation des données du promoteur
  const refreshPromoterData = async () => {
    try {
      await storageService.initCloudSync();
    } catch {}
    if (promoter?.id) {
      const fresh = storageService.getPromoterById(promoter.id);
      if (fresh) setPromoter(fresh);
    }
  };

  useEffect(() => {
    const handleStorage = () => refreshPromoterData();
    const handleHash = () => {
      const p = getInitialPromoter();
      if (p) setPromoter(p);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [promoter?.id]);

  // Handler création du mot de passe initial
  const handleSetupPassword = (e) => {
    e.preventDefault();
    setSetupError('');

    if (!newPassword || newPassword.length < 4) {
      setSetupError("Votre mot de passe doit comporter au moins 4 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetupError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const res = storageService.setPromoterPassword(promoter.id, newPassword);
    if (res.success) {
      try {
        sessionStorage.setItem(`mrben_promoter_session_${promoter.id}`, 'active');
      } catch {}
      setPromoter(res.promoter);
      setIsAuthenticated(true);
    } else {
      setSetupError(res.message || "Erreur lors de l'enregistrement.");
    }
  };

  // Handler connexion avec mot de passe
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const res = storageService.verifyPromoterLogin(promoter.id, loginPassword);
    if (res.success) {
      try {
        sessionStorage.setItem(`mrben_promoter_session_${promoter.id}`, 'active');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setLoginError(res.message || "Mot de passe incorrect.");
    }
  };

  // Handler déconnexion
  const handleLogout = () => {
    try {
      sessionStorage.removeItem(`mrben_promoter_session_${promoter.id}`);
    } catch {}
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  const [shareFeedback, setShareFeedback] = useState(null);

  const triggerFeedback = (msg) => {
    setShareFeedback(msg);
    setTimeout(() => setShareFeedback(null), 3500);
  };

  const handleCopy = (text, typeKey) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(typeKey);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const referralLink = `${window.location.origin}/#formations?promo=${promoter?.codePromo || ''}&pct=${promoter?.reductionPct || 20}&name=${encodeURIComponent(promoter?.prenom || 'Partenaire')}`;

  const shareText = `Bonjour ! Découvre les formations officielles de Mr Ben pour créer des Bandes Dessinées et des Vidéos Virales avec l'IA 🚀.\n\nProfite de -${promoter?.reductionPct || 20}% de réduction immédiate avec mon code promo exclusif : *${promoter?.codePromo}*\n\nAccès direct : ${referralLink}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=450');
  };

  const handleShareYouTube = () => {
    handleCopy(shareText, 'share_all');
    triggerFeedback("Texte & lien copiés ! À coller dans vos descriptions ou l'onglet Communauté YouTube.");
    setTimeout(() => {
      window.open('https://studio.youtube.com', '_blank');
    }, 500);
  };

  const handleShareTikTok = () => {
    handleCopy(referralLink, 'link');
    triggerFeedback("Lien affilié copié ! Collez-le dans votre bio ou vos vidéos TikTok.");
    setTimeout(() => {
      window.open('https://www.tiktok.com', '_blank');
    }, 500);
  };

  const handleShareInstagram = () => {
    handleCopy(referralLink, 'link');
    triggerFeedback("Lien affilié copié ! Collez-le en Story ou dans votre bio Instagram.");
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 500);
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Formation Mr Ben - Code ${promoter?.codePromo || ''}`,
          text: shareText,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy(shareText, 'share_all');
      triggerFeedback("Message complet copié dans votre presse-papier !");
    }
  };

  const handleClaimPayoutWhatsApp = () => {
    const text = `Bonjour Mr Ben ! Je suis ${promoter?.prenom || ''} ${promoter?.nom || ''}, promoteur avec le code ${promoter?.codePromo}. J'ai accumulé ${(promoter?.totalEarned || 0).toLocaleString()} FCFA de commissions sur mon espace partenaire et je souhaite faire le point pour mon versement. Merci !`;
    const url = `https://wa.me/22900000000?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!promoter) {
    return (
      <div className="promoter-page-backdrop">
        <div className="promoter-card-modal">
          <div className="promoter-badge-icon purple">
            <Users size={22} />
          </div>
          <h3>Espace Promoteur Introuvable</h3>
          <p>Le compte promoteur demandé n'existe pas ou le lien est incomplet.</p>
          <button className="btn-promoter-primary gold" onClick={onClose}>
            Retourner au site
          </button>
        </div>
      </div>
    );
  }

  const promoterInitials = `${(promoter?.prenom?.[0] || 'P')}${(promoter?.nom?.[0] || 'M')}`.toUpperCase();

  return (
    <div className="promoter-page-backdrop">
      
      {!isAuthenticated ? (
        /* ÉCRAN DE CONNEXION / INITIALISATION DU MOT DE PASSE */
        <div className="promoter-auth-box">
          <div className="auth-header-card">
            <div className="brand-logo-mark purple">MB</div>
            <h2>Espace Partenaire Promoteur</h2>
            <p className="auth-subtitle">Plateforme Officielle Mr Ben</p>
          </div>

          {!promoter.password ? (
            /* PREMIÈRE VISITE : DÉFINITION DU MOT DE PASSE */
            <form onSubmit={handleSetupPassword} className="auth-form-card">
              <div className="welcome-promoter-badge">
                <Sparkles size={14} className="text-gold" />
                <span>Bienvenue, <strong>{promoter.prenom}</strong> !</span>
              </div>

              <div className="username-display-strip">
                <span className="lbl">Nom d'utilisateur :</span>
                <span className="val">{promoter.prenom}</span>
              </div>

              <div className="auth-notice-alert">
                <AlertCircle size={15} />
                <span>
                  <strong>Important :</strong> Définissez votre mot de passe secret. Mémorisez-le précieusement, il vous sera demandé à chaque connexion.
                </span>
              </div>

              {setupError && <div className="auth-error-pill">{setupError}</div>}

              <div className="auth-input-group">
                <label>Créer votre mot de passe :</label>
                <div className="input-password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Au moins 4 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button 
                    type="button" 
                    className="btn-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Confirmer votre mot de passe :</label>
                <div className="input-password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez à l'identique"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-promoter-primary purple">
                <span>Enregistrer & Accéder à mon espace</span>
                <ArrowRight size={15} />
              </button>

              <button type="button" className="btn-promoter-link" onClick={onClose}>
                Retourner sur le site
              </button>
            </form>
          ) : (
            /* VISITES SUIVANTES : CONNEXION PAR MOT DE PASSE */
            <form onSubmit={handleLogin} className="auth-form-card">
              <div className="welcome-promoter-badge">
                <span>Bonjour, <strong>{promoter.prenom}</strong></span>
              </div>

              <div className="username-display-strip">
                <span className="lbl">Identifiant :</span>
                <span className="val">{promoter.prenom}</span>
              </div>

              {loginError && <div className="auth-error-pill">{loginError}</div>}

              <div className="auth-input-group">
                <label>Votre mot de passe :</label>
                <div className="input-password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button 
                    type="button" 
                    className="btn-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-promoter-primary purple">
                <span>Accéder à mon espace</span>
                <ArrowRight size={15} />
              </button>

              <button type="button" className="btn-promoter-link" onClick={onClose}>
                Retourner sur le site
              </button>
            </form>
          )}

        </div>
      ) : (
        /* TABLEAU DE BORD PERSONNEL DU PROMOTEUR */
        <div className="promoter-dashboard-container">
          
          {/* Header Dashboard Épuré & Professionnel */}
          <header className="promoter-topbar">
            <div className="topbar-brand-left">
              <div className="topbar-avatar-badge" title={`${promoter.prenom} ${promoter.nom}`}>
                {promoterInitials}
              </div>
              <div className="topbar-meta">
                <div className="topbar-title-row">
                  <h1 className="portal-app-title">Espace Partenaire</h1>
                  <span className="portal-cert-pill">
                    <ShieldCheck size={11} />
                    <span>Certifié Mr Ben</span>
                  </span>
                </div>
                <span className="portal-user-name">{promoter.prenom} {promoter.nom} • Ambassadeur</span>
              </div>
            </div>

            <div className="topbar-actions-right">
              <button 
                type="button" 
                className="btn-topbar-tool ghost"
                onClick={onClose}
                title="Retourner sur le site"
              >
                <Globe size={13} />
                <span className="btn-label-desktop">Voir le site</span>
                <span className="btn-label-mobile">Site</span>
              </button>

              <button 
                type="button" 
                className="btn-topbar-tool logout"
                onClick={handleLogout}
                title="Fermer la session"
              >
                <LogOut size={13} />
                <span className="btn-label-desktop">Déconnexion</span>
                <span className="btn-label-mobile">Quitter</span>
              </button>
            </div>
          </header>

          {/* Corps de la page */}
          <main className="promoter-main-body">
            
            {/* Bannière de Bienvenue & Code Promo (Compacte & Moderne) */}
            <div className="promoter-promo-card">
              <div className="promo-card-left">
                <div className="promo-kicker-row">
                  <span className="promo-badge-tag">VOTRE CODE PROMO EXCLUSIF</span>
                  <span className="promo-rules-pill">-{promoter.reductionPct}% pour vos élèves • {promoter.commissionPct}% de commission</span>
                </div>

                <div className="promo-code-action-box">
                  <div className="promo-code-token" onClick={() => handleCopy(promoter.codePromo, 'code')} title="Cliquer pour copier">
                    <span className="token-text">{promoter.codePromo}</span>
                    <button 
                      type="button" 
                      className="btn-copy-token"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(promoter.codePromo, 'code');
                      }}
                      title="Copier le code"
                    >
                      {copiedItem === 'code' ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                      <span>{copiedItem === 'code' ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>

                  <p className="promo-summary-hint">
                    Chaque personne qui applique votre code bénéficie de <strong>-{promoter.reductionPct}% de remise</strong>, et vous touchez <strong>{promoter.commissionPct}% de commission</strong> nette sur chaque vente.
                  </p>
                </div>
              </div>

              <div className="promo-card-right">
                <button 
                  type="button" 
                  className="btn-share-trigger"
                  onClick={() => setIsShareModalOpen(true)}
                  title="Partager sur tous vos réseaux sociaux"
                >
                  <Share2 size={14} />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {/* Grille des 4 Métriques Clés (Compacte & Design Fin) */}
            <div className="promoter-kpi-grid">
              
              <div className="kpi-metric-card">
                <div className="kpi-metric-top">
                  <span className="kpi-metric-label">Ventes Réalisées</span>
                  <div className="kpi-metric-icon indigo"><Users size={14} /></div>
                </div>
                <div className="kpi-metric-val">{promoter.salesCount || 0}</div>
                <div className="kpi-metric-footnote">
                  <span>Élèves inscrits avec votre code</span>
                </div>
              </div>

              <div className="kpi-metric-card highlighted-earnings">
                <div className="kpi-metric-top">
                  <span className="kpi-metric-label">Vos Gains Cumulés</span>
                  <div className="kpi-metric-icon emerald"><DollarSign size={14} /></div>
                </div>
                <div className="kpi-metric-val text-emerald">
                  {(promoter.totalEarned || 0).toLocaleString()} <span className="kpi-unit-pill">FCFA</span>
                </div>
                <div className="kpi-metric-footnote">
                  <span className="badge-available">Total de vos commissions</span>
                </div>
              </div>

              <div className="kpi-metric-card">
                <div className="kpi-metric-top">
                  <span className="kpi-metric-label">Réduction Élève</span>
                  <div className="kpi-metric-icon amber"><Tag size={14} /></div>
                </div>
                <div className="kpi-metric-val text-amber">-{promoter.reductionPct}%</div>
                <div className="kpi-metric-footnote">
                  <span>Remise accordée au client</span>
                </div>
              </div>

              <div className="kpi-metric-card">
                <div className="kpi-metric-top">
                  <span className="kpi-metric-label">Votre Commission</span>
                  <div className="kpi-metric-icon sky"><TrendingUp size={14} /></div>
                </div>
                <div className="kpi-metric-val text-sky">{promoter.commissionPct}%</div>
                <div className="kpi-metric-footnote">
                  <span>De part sur le montant payé</span>
                </div>
              </div>

            </div>

            {/* Lien direct d'invitation */}
            <div className="promoter-section-card">
              <div className="section-card-head">
                <div className="head-icon-box"><Globe size={14} /></div>
                <div className="head-text-col">
                  <h3>Lien d'Invitation Direct</h3>
                  <p>Les personnes qui cliquent sur ce lien verront votre code promo appliqué automatiquement.</p>
                </div>
              </div>

              <div className="referral-input-wrapper">
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                />
                <button 
                  type="button" 
                  className="btn-copy-strip"
                  onClick={() => handleCopy(referralLink, 'link')}
                >
                  {copiedItem === 'link' ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                  <span>{copiedItem === 'link' ? 'Lien copié' : 'Copier le lien'}</span>
                </button>
              </div>
            </div>

            {/* Tableau de l'historique des ventes */}
            <div className="promoter-section-card">
              <div className="section-card-head">
                <div className="head-icon-box"><Clock size={14} /></div>
                <div className="head-text-col">
                  <h3>Historique de vos Ventes</h3>
                  <p>Suivi en direct de chaque transaction validée avec votre code promo.</p>
                </div>
              </div>

              {promoter.salesHistory && promoter.salesHistory.length > 0 ? (
                <div className="promoter-table-container">
                  <table className="promoter-clean-table">
                    <thead>
                      <tr>
                        <th>Date & Heure</th>
                        <th>Formation</th>
                        <th>Montant Payé</th>
                        <th className="th-right">Votre Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoter.salesHistory.map((s) => (
                        <tr key={s.id}>
                          <td className="td-date">{s.date}</td>
                          <td className="td-item">
                            <span className="item-title">{s.bookTitle}</span>
                          </td>
                          <td className="td-amount">{(s.paidAmount || 0).toLocaleString()} FCFA</td>
                          <td className="td-right td-commission">
                            +{(s.commissionEarned || 0).toLocaleString()} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="promoter-empty-state">
                  <Tag size={20} className="empty-faded-icon" />
                  <p className="empty-title">Aucune vente enregistrée pour le moment</p>
                  <span className="empty-desc">
                    Partagez votre code promo ou votre lien d'invitation pour commencer à encaisser vos commissions !
                  </span>
                </div>
              )}
            </div>

            {/* Demande de virement des gains */}
            <div className="promoter-payout-box">
              <div className="payout-content-left">
                <div className="payout-status-row">
                  <span className="payout-tag-label">VERSEMENT DES COMMISSIONS</span>
                  <span className="payout-balance-pill">
                    Solde accumulé : <strong>{(promoter.totalEarned || 0).toLocaleString()} FCFA</strong>
                  </span>
                </div>
                <p className="payout-help-note">
                  Les virements s'effectuent par Mobile Money (MTN, Moov, Wave). Cliquez ci-contre pour faire le point avec Mr Ben sur WhatsApp.
                </p>
              </div>
              <button 
                type="button" 
                className="btn-payout-action"
                onClick={handleClaimPayoutWhatsApp}
              >
                <span>Demander mon versement</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </main>
        </div>
      )}

      {/* MODAL DE PARTAGE MULTI-RÉSEAUX (FINTECH / ÉPURÉ & PROFESSIONNEL) */}
      {isShareModalOpen && (
        <div className="share-modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
          <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div className="share-header-left">
                <div className="share-header-icon">
                  <Share2 size={15} />
                </div>
                <div>
                  <h4 className="share-modal-title">Partager votre lien affilié</h4>
                  <p className="share-modal-desc">Touchez 50% de commission sur chaque vente générée</p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-share-close"
                onClick={() => setIsShareModalOpen(false)}
                title="Fermer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Grille des plateformes */}
            {shareFeedback && (
              <div className="share-feedback-toast">
                <Check size={13} className="text-emerald" />
                <span>{shareFeedback}</span>
              </div>
            )}

            <div className="share-platforms-grid">
              {/* WhatsApp */}
              <button type="button" className="btn-social-item whatsapp" onClick={handleShareWhatsApp}>
                <div className="social-icon-wrapper wa">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.18c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button type="button" className="btn-social-item facebook" onClick={handleShareFacebook}>
                <div className="social-icon-wrapper fb">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>Facebook</span>
              </button>

              {/* YouTube */}
              <button type="button" className="btn-social-item youtube" onClick={handleShareYouTube} title="Copier pour YouTube">
                <div className="social-icon-wrapper yt">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span>YouTube</span>
              </button>

              {/* TikTok */}
              <button type="button" className="btn-social-item tiktok" onClick={handleShareTikTok} title="Copier pour TikTok Bio / Vidéos">
                <div className="social-icon-wrapper tt">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <span>TikTok</span>
              </button>

              {/* Instagram */}
              <button type="button" className="btn-social-item instagram" onClick={handleShareInstagram} title="Copier pour Instagram Story / Bio">
                <div className="social-icon-wrapper ig">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span>Instagram</span>
              </button>

              {/* Telegram */}
              <button type="button" className="btn-social-item telegram" onClick={handleShareTelegram}>
                <div className="social-icon-wrapper tg">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <span>Telegram</span>
              </button>

              {/* LinkedIn */}
              <button type="button" className="btn-social-item linkedin" onClick={handleShareLinkedIn}>
                <div className="social-icon-wrapper in">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76M7.86 18.5v-8.37H5.07v8.37h2.79z"/>
                  </svg>
                </div>
                <span>LinkedIn</span>
              </button>

              {/* X (Twitter) */}
              <button type="button" className="btn-social-item twitter" onClick={handleShareTwitter}>
                <div className="social-icon-wrapper tw">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span>X (Twitter)</span>
              </button>

              {/* Autres Apps (Partage Système) */}
              <button type="button" className="btn-social-item more" onClick={handleShareNative} title="Partager via autres applications">
                <div className="social-icon-wrapper more-icon">
                  <Share2 size={15} />
                </div>
                <span>Autres apps</span>
              </button>
            </div>

            {/* Encadré Copier le Message Complet */}
            <div className="share-quick-copy-box">
              <div className="quick-copy-text">
                <span className="quote-badge">Texte prêt à poster</span>
                <p>{shareText}</p>
              </div>
              <button 
                type="button" 
                className={`btn-copy-full-msg ${copiedItem === 'share_all' ? 'copied' : ''}`}
                onClick={() => handleCopy(shareText, 'share_all')}
              >
                {copiedItem === 'share_all' ? (
                  <>
                    <Check size={13} className="text-emerald" />
                    <span>Message copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copier le message complet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PromoterPortal;
