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
  AlertCircle
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

  // Synchronisation des données du promoteur
  const refreshPromoterData = () => {
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

  const handleCopy = (text, typeKey) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(typeKey);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const referralLink = `${window.location.origin}/#formations?promo=${promoter?.codePromo || ''}`;

  const shareText = `Bonjour ! Découvre les formations officielles de Mr Ben pour créer des Bandes Dessinées et des Vidéos Virales avec l'IA 🚀.\n\nProfite de -${promoter?.reductionPct || 20}% de réduction immédiate avec mon code promo exclusif : *${promoter?.codePromo}*\n\nAccès direct : ${referralLink}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
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
                <span>Voir le site</span>
              </button>

              <button 
                type="button" 
                className="btn-topbar-tool logout"
                onClick={handleLogout}
                title="Fermer la session"
              >
                <LogOut size={13} />
                <span>Déconnexion</span>
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
                  className="btn-whatsapp-action"
                  onClick={handleShareWhatsApp}
                >
                  <Share2 size={15} />
                  <span>Partager sur WhatsApp</span>
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

    </div>
  );
}

export default PromoterPortal;
