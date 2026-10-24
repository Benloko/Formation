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
  ArrowLeft,
  Globe,
  Sparkles,
  Award,
  AlertCircle,
  Phone,
  Mail,
  KeyRound,
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
  
  // Session persistante sur l'appareil (ne redemande pas le mot de passe à chaque réouverture du lien)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (!promoter?.id) return false;
      return localStorage.getItem(`mrben_promoter_session_${promoter.id}`) === 'active' ||
             sessionStorage.getItem(`mrben_promoter_session_${promoter.id}`) === 'active';
    } catch {
      return false;
    }
  });

  // États pour la création initiale : Étape 1 (Mot de passe) / Étape 2 (Gmail & Retrait)
  const [setupStep, setSetupStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Profil de retrait & récupération
  const [selectedGmail, setSelectedGmail] = useState(() => promoter?.email || storageService.getLoggedInGmail() || '');
  const [payoutPhone, setPayoutPhone] = useState(() => promoter?.payoutPhone || promoter?.whatsapp || '');
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => storageService.getGoogleAccounts() || []);

  // États pour la connexion ultérieure
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Mot de passe oublié
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveredGmail, setRecoveredGmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  // États d'action
  const [copiedItem, setCopiedItem] = useState(null);

  // Synchronisation des données du promoteur avec le cloud
  const refreshPromoterData = async () => {
    try {
      await storageService.initCloudSync();
    } catch {}
    if (promoter?.id) {
      const fresh = storageService.getPromoterById(promoter.id);
      if (fresh) {
        setPromoter(fresh);
        if (fresh.email && !selectedGmail) setSelectedGmail(fresh.email);
        if (fresh.payoutPhone && !payoutPhone) setPayoutPhone(fresh.payoutPhone);
      }
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
    
    // Détection des comptes Google sur l'appareil
    try {
      setSavedAccounts(storageService.getGoogleAccounts() || []);
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [promoter?.id]);

  // Handler Étape 1 : Validation du mot de passe initial
  const handleStep1Password = (e) => {
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

    setSetupStep(2);
  };

  // Handler Sélection directe Google OAuth (Comme dans le checkout / panier)
  const handleGoogleSignIn = () => {
    setSetupError('');
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.oauth2 && googleClientId) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userData = await res.json();
                if (userData.email) {
                  const clean = userData.email.trim().toLowerCase();
                  setSelectedGmail(clean);
                  storageService.addGoogleAccount(clean, userData.name || clean.split('@')[0]);
                  setSavedAccounts(storageService.getGoogleAccounts() || []);
                }
              } catch (e) {
                console.error("Erreur profil Google:", e);
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error("Erreur Google OAuth:", err);
      }
    } else if (googleClientId) {
      const redirectUri = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;
      window.open(authUrl, 'GoogleSignIn', 'width=500,height=600');
    }
  };

  // Handler Étape 2 : Finalisation du profil (Gmail + Mobile Money) et enregistrement cloud
  const handleStep2CompleteProfile = async (e) => {
    e.preventDefault();
    setSetupError('');

    const finalEmail = (selectedGmail || manualEmailInput).trim().toLowerCase();
    if (!finalEmail || !finalEmail.includes('@')) {
      setSetupError("Veuillez sélectionner ou indiquer votre compte Gmail.");
      return;
    }
    if (!payoutPhone || payoutPhone.trim().length < 6) {
      setSetupError("Veuillez indiquer votre numéro Mobile Money de retrait.");
      return;
    }

    setIsSubmittingSetup(true);
    const res = await storageService.setPromoterPassword(promoter.id, newPassword, finalEmail, payoutPhone);
    setIsSubmittingSetup(false);

    if (res.success) {
      try {
        localStorage.setItem(`mrben_promoter_session_${promoter.id}`, 'active');
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
        localStorage.setItem(`mrben_promoter_session_${promoter.id}`, 'active');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setLoginError(res.message || "Mot de passe incorrect.");
    }
  };

  // Handler déconnexion
  const handleLogout = () => {
    try {
      localStorage.removeItem(`mrben_promoter_session_${promoter.id}`);
      sessionStorage.removeItem(`mrben_promoter_session_${promoter.id}`);
    } catch {}
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  // Handler mot de passe oublié avec Google
  const handleRecoverWithGoogle = () => {
    setRecoveryError('');
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.oauth2 && googleClientId) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userData = await res.json();
                if (userData.email) {
                  const verifiedEmail = userData.email.trim().toLowerCase();
                  if (promoter.email && promoter.email.toLowerCase() !== verifiedEmail) {
                    setRecoveryError(`Ce compte (${verifiedEmail}) ne correspond pas au compte associé (${promoter.email}).`);
                    return;
                  }
                  setRecoveredGmail(verifiedEmail);
                }
              } catch (e) {
                setRecoveryError("Erreur lors de la vérification Google.");
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setRecoveryError("Impossible d'ouvrir Google.");
      }
    }
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    setRecoveryError('');

    if (!resetPassword || resetPassword.length < 4) {
      setRecoveryError("Le nouveau mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    const res = await storageService.setPromoterPassword(promoter.id, resetPassword, recoveredGmail || promoter.email);
    if (res.success) {
      setRecoverySuccess("Mot de passe mis à jour ! Vous pouvez vous connecter.");
      setLoginPassword(resetPassword);
      setIsRecovering(false);
      setPromoter(res.promoter);
    } else {
      setRecoveryError("Erreur lors de la réinitialisation.");
    }
  };

  const handleCopy = (text, typeKey) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(typeKey);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const referralLink = `${window.location.origin}/#formations?promo=${promoter?.codePromo || ''}&pct=${promoter?.reductionPct || 20}&name=${encodeURIComponent(promoter?.prenom || 'Partenaire')}`;

  const shareText = `Bonjour ! Découvre les formations officielles de Mr Ben pour créer des Bandes Dessinées et des Vidéos Virales avec l'IA 🚀.\n\nProfite de -${promoter?.reductionPct || 20}% de réduction immédiate avec mon code promo exclusif : *${promoter?.codePromo}*\n\nAccès direct : ${referralLink}`;

  // PARTAGE DIRECT : DÉCLENCHE DIRECTEMENT LE MENU SYSTÈME DU SMARTPHONE (WhatsApp, TikTok, Facebook, etc.)
  const handleShareNative = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Formation Mr Ben - Code ${promoter?.codePromo || ''}`,
          text: shareText,
          url: referralLink,
        });
      } catch (err) {
        // Annulé par l'utilisateur
      }
    } else {
      // Fallback automatique sur PC : copie dans le presse-papier avec confirmation
      handleCopy(shareText, 'share_all');
    }
  };

  const handleClaimPayoutWhatsApp = () => {
    const payoutTarget = promoter?.payoutPhone || promoter?.whatsapp || 'Numéro Mobile Money du profil';
    const text = `Bonjour Mr Ben ! Je suis ${promoter?.prenom || ''} ${promoter?.nom || ''}, promoteur avec le code ${promoter?.codePromo}. J'ai accumulé ${(promoter?.totalEarned || 0).toLocaleString()} FCFA de commissions sur mon espace partenaire et je souhaite faire le point pour mon versement sur mon compte Mobile Money (${payoutTarget}). Merci !`;
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

          {isRecovering ? (
            /* RÉCUPÉRATION DU MOT DE PASSE AVEC GOOGLE */
            <div className="auth-form-card">
              <div className="welcome-promoter-badge">
                <KeyRound size={14} className="text-gold" />
                <span>Récupération de compte</span>
              </div>

              <div className="auth-notice-alert">
                <AlertCircle size={15} />
                <span>
                  Connectez-vous avec votre compte Google associé (<strong>{promoter.email || promoter.prenom}</strong>) pour réinitialiser votre mot de passe en toute sécurité.
                </span>
              </div>

              {recoveryError && <div className="auth-error-pill">{recoveryError}</div>}
              {recoverySuccess && <div className="auth-success-pill">{recoverySuccess}</div>}

              {recoveredGmail ? (
                /* Étape de saisie du nouveau mot de passe une fois Google validé */
                <form onSubmit={handleSaveResetPassword} className="auth-inner-form">
                  <div className="verified-gmail-box">
                    <div className="verified-gmail-left">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span className="verified-email-text">{recoveredGmail}</span>
                    </div>
                    <CheckCircle2 size={15} className="text-emerald" />
                  </div>

                  <div className="auth-input-group">
                    <label>Nouveau mot de passe :</label>
                    <div className="input-password-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Au moins 4 caractères"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
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
                    <span>Enregistrer mon nouveau mot de passe</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                /* Bouton Google 1-Clic pour prouver l'identité */
                <div className="recovery-actions-col">
                  <button 
                    type="button" 
                    className="btn-google-native-select"
                    onClick={handleRecoverWithGoogle}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Vérifier avec Google</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-promoter-link"
                    onClick={() => { setIsRecovering(false); setRecoveryError(''); }}
                  >
                    Retour à la connexion
                  </button>
                </div>
              )}
            </div>
          ) : !promoter.password ? (
            /* PREMIÈRE CONNEXION : ONBOARDING EN 2 ÉTAPES */
            <div className="auth-form-card">
              
              {/* Indicateur d'étape */}
              <div className="setup-steps-header">
                <div className={`step-pill ${setupStep === 1 ? 'active' : 'done'}`}>
                  <span className="step-num">1</span>
                  <span className="step-txt">Mot de passe</span>
                </div>
                <div className="step-divider" />
                <div className={`step-pill ${setupStep === 2 ? 'active' : ''}`}>
                  <span className="step-num">2</span>
                  <span className="step-txt">Gmail & Retrait</span>
                </div>
              </div>

              {setupStep === 1 ? (
                /* ÉTAPE 1 : DÉFINITION DU MOT DE PASSE */
                <form onSubmit={handleStep1Password} className="auth-inner-form">
                  <div className="welcome-promoter-badge">
                    <Sparkles size={14} className="text-gold" />
                    <span>Bienvenue, <strong>{promoter.prenom}</strong> !</span>
                  </div>

                  <div className="username-display-strip">
                    <span className="lbl">Code Partenaire :</span>
                    <span className="val">{promoter.codePromo}</span>
                  </div>

                  <p className="auth-step-instruction">
                    Définissez votre mot de passe secret. Il sera enregistré pour toutes vos prochaines connexions.
                  </p>

                  {setupError && <div className="auth-error-pill">{setupError}</div>}

                  <div className="auth-input-group">
                    <label>Votre mot de passe :</label>
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
                    <label>Confirmer le mot de passe :</label>
                    <div className="input-password-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Répétez le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-promoter-primary purple">
                    <span>Continuer vers la sécurisation</span>
                    <ArrowRight size={15} />
                  </button>

                  <button type="button" className="btn-promoter-link" onClick={onClose}>
                    Retourner sur le site
                  </button>
                </form>
              ) : (
                /* ÉTAPE 2 : SÉLECTION GMAIL & NUMÉRO RETRAIT */
                <form onSubmit={handleStep2CompleteProfile} className="auth-inner-form">
                  <div className="welcome-promoter-badge">
                    <ShieldCheck size={14} className="text-sky" />
                    <span>Sécurisation & Numéro de Retrait</span>
                  </div>

                  <p className="auth-step-instruction">
                    Associez votre compte Gmail en un clic pour récupérer vos accès en cas d'oubli, et renseignez votre numéro Mobile Money pour recevoir vos commissions.
                  </p>

                  {setupError && <div className="auth-error-pill">{setupError}</div>}

                  {/* Choix direct du Gmail via le système (Google 1-clic) */}
                  <div className="auth-input-group">
                    <label>Votre compte Gmail (Sélection en 1 clic) :</label>

                    {selectedGmail ? (
                      <div className="verified-gmail-box">
                        <div className="verified-gmail-left">
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span className="verified-email-text">{selectedGmail}</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn-change-selection"
                          onClick={handleGoogleSignIn}
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <div className="google-selection-container">
                        <button 
                          type="button" 
                          className="btn-google-native-select"
                          onClick={handleGoogleSignIn}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span>Sélectionner mon compte Google</span>
                        </button>

                        {/* Comptes déjà enregistrés sur le mobile si existants */}
                        {savedAccounts && savedAccounts.length > 0 && (
                          <div className="saved-accounts-strip">
                            <span className="saved-lbl">Ou choisir un compte détecté :</span>
                            <div className="chips-row">
                              {savedAccounts.slice(0, 3).map((acc) => (
                                <button
                                  key={acc.email}
                                  type="button"
                                  className="account-chip-btn"
                                  onClick={() => setSelectedGmail(acc.email)}
                                >
                                  {acc.email}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Numéro de téléphone Mobile Money de retrait */}
                  <div className="auth-input-group">
                    <label>Numéro de retrait Mobile Money (MTN / Moov / Wave) :</label>
                    <div className="input-phone-wrapper">
                      <Phone size={15} className="input-phone-icon" />
                      <input 
                        type="tel"
                        placeholder="Ex: +229 97 00 00 00"
                        value={payoutPhone}
                        onChange={(e) => setPayoutPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-promoter-primary purple"
                    disabled={isSubmittingSetup}
                  >
                    <span>{isSubmittingSetup ? "Enregistrement sécurisé..." : "Valider & Accéder à mon espace"}</span>
                    <ArrowRight size={15} />
                  </button>

                  <button 
                    type="button" 
                    className="btn-promoter-link"
                    onClick={() => setSetupStep(1)}
                  >
                    ← Modifier mon mot de passe
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* VISITES SUIVANTES : CONNEXION RAPIDE */
            <form onSubmit={handleLogin} className="auth-form-card">
              <div className="welcome-promoter-badge">
                <span>Bonjour, <strong>{promoter.prenom}</strong></span>
              </div>

              <div className="username-display-strip">
                <span className="lbl">Code Partenaire :</span>
                <span className="val">{promoter.codePromo}</span>
              </div>

              {loginError && <div className="auth-error-pill">{loginError}</div>}

              <div className="auth-input-group">
                <div className="label-with-action">
                  <label>Votre mot de passe :</label>
                  <button 
                    type="button" 
                    className="btn-forgot-pwd"
                    onClick={() => { setIsRecovering(true); setRecoveryError(''); setRecoverySuccess(''); }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
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
                  className={`btn-share-trigger ${copiedItem === 'share_all' ? 'active-copied' : ''}`}
                  onClick={handleShareNative}
                  title="Partager directement via votre smartphone (WhatsApp, TikTok, Facebook, etc.)"
                >
                  {copiedItem === 'share_all' ? <Check size={14} className="text-emerald" /> : <Share2 size={14} />}
                  <span>{copiedItem === 'share_all' ? 'Message & lien copiés !' : 'Partager'}</span>
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
