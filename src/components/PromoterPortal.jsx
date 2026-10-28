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
  X,
  RotateCcw,
  MessageCircle
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

  // Mot de passe oublié (par code de confirmation envoyé sur Gmail)
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState('request'); // 'request' | 'verify'
  const [recoveryCode, setRecoveryCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [maskedGmail, setMaskedGmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveredGmail, setRecoveredGmail] = useState('');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');

  // États d'action
  const [copiedItem, setCopiedItem] = useState(null);

  // États de personnalisation et de partage du message
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('storytelling');
  const [customShareMessage, setCustomShareMessage] = useState('');

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

  // 1. Demande d'envoi du code de confirmation à 6 chiffres sur Gmail
  const handleSendRecoveryCode = async () => {
    setRecoveryError('');
    setRecoverySuccess('');

    const targetEmail = (promoter?.email || recoveryEmailInput || selectedGmail || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setRecoveryError("Veuillez renseigner une adresse Gmail valide.");
      return;
    }

    setIsSendingCode(true);
    const res = await storageService.sendPromoterResetCode(
      promoter?.id, 
      targetEmail, 
      promoter?.codePromo
    );
    setIsSendingCode(false);

    if (res.success) {
      setMaskedGmail(res.maskedEmail || targetEmail);
      setRecoveryStep('verify');
      setRecoverySuccess(res.message || "Un code de confirmation à 6 chiffres a été envoyé sur votre adresse Gmail.");
    } else {
      setRecoveryError(res.error || "Impossible d'envoyer le code sur votre adresse Gmail.");
    }
  };

  // 2. Validation du code reçu par e-mail et mise à jour du mot de passe
  const handleConfirmResetCode = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    const cleanCode = String(recoveryCode).trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setRecoveryError("Veuillez saisir le code complet à 6 chiffres reçu par e-mail.");
      return;
    }

    if (!resetPassword || resetPassword.length < 4) {
      setRecoveryError("Le nouveau mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setIsVerifyingCode(true);
    const res = await storageService.verifyPromoterResetCode(promoter?.id, cleanCode, resetPassword);
    setIsVerifyingCode(false);

    if (res.success) {
      if (res.promoter) {
        setPromoter(res.promoter);
      }
      setLoginPassword(resetPassword);
      setIsRecovering(false);
      setRecoveryStep('request');
      setRecoveryCode('');
      setResetPassword('');
      try {
        localStorage.setItem(`mrben_promoter_session_${promoter?.id}`, 'active');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setRecoveryError(res.error || "Code de confirmation incorrect ou expiré.");
    }
  };

  // Fallback 1-clic : vérification instantanée avec Google OAuth
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
                  setRecoveryStep('verify');
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
      setRecoverySuccess("Mot de passe mis à jour ! Vous êtes connecté.");
      setLoginPassword(resetPassword);
      setIsRecovering(false);
      setRecoveryStep('request');
      setPromoter(res.promoter);
      try {
        localStorage.setItem(`mrben_promoter_session_${promoter?.id}`, 'active');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setRecoveryError("Erreur lors de la réinitialisation.");
    }
  };

  const handleCopy = (text, typeKey) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(typeKey);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const referralLink = `${window.location.origin}/?promo=${promoter?.codePromo || ''}&pct=${promoter?.reductionPct || 20}&tab=formations#formations`;

  const getShareTemplates = (p, link) => {
    const code = p?.codePromo || 'PROMO';
    const pct = p?.reductionPct || 20;

    return [
      {
        id: 'storytelling',
        title: '🌟 BD & Storytelling IA',
        badge: 'Recommandé',
        shortDesc: 'Création de BD captivantes et belles images avec l\'IA sur smartphone',
        message: `Apprends à concevoir facilement de superbes Bandes Dessinées et des illustrations captivantes avec l'IA grâce à la méthode de Mr Ben, 100% accessible sur smartphone. Profite de -${pct}% de réduction immédiate en utilisant mon code promo *${code}* sur le lien officiel : ${link}`
      },
      {
        id: 'video',
        title: '🎬 Vidéos TikTok & Reels',
        badge: 'Viral & Vues',
        shortDesc: 'Vidéos virales, animations et personnages cohérents sans abonnement payant',
        message: `Découvre comment créer des vidéos ultra virales, animer tes personnages et monétiser tes contenus sur TikTok, Reels et Shorts avec l'IA. Profite de -${pct}% de réduction immédiate en utilisant mon code promo *${code}* sur le lien officiel : ${link}`
      },
      {
        id: 'discount',
        title: '🎁 Bon Plan Réduction -' + pct + '%',
        badge: 'Offre VIP',
        shortDesc: 'Focus direct sur le code promo et l\'économie immédiate',
        message: `Profite d'une réduction exclusive de -${pct}% sur toutes les formations officielles de Mr Ben (Bandes Dessinées & Vidéos Virales avec l'IA) en utilisant mon code promo *${code}* sur ce lien : ${link}`
      },
      {
        id: 'short',
        title: '⚡ Court & Statut WhatsApp',
        badge: 'Statut / SMS',
        shortDesc: 'Court et concis, parfait pour Statut WhatsApp ou Story Instagram',
        message: `Formations BD & Vidéos virales avec l'IA par Mr Ben 🚀 Bénéficie de -${pct}% de réduction immédiate en utilisant mon code promo *${code}* ici : ${link}`
      }
    ];
  };

  const shareTemplates = getShareTemplates(promoter, referralLink);
  const activeTemplate = shareTemplates.find(t => t.id === selectedTemplateId) || shareTemplates[0];
  const activeMessage = customShareMessage || activeTemplate.message;

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tmpl = shareTemplates.find(t => t.id === templateId) || shareTemplates[0];
    setCustomShareMessage(tmpl.message);
  };

  const handleResetTemplate = () => {
    setCustomShareMessage(activeTemplate.message);
  };

  // PARTAGE NATIVE SMARTPHONE (WHATSAPP, TIKTOK, FACEBOOK, INSTAGRAM, TELEGRAM, ETC.)
  const handleShareNative = async (customText) => {
    const textToSend = customText || activeMessage;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Envoi du message complet sans paramètre url séparé pour empêcher les réseaux de tronquer le message
        await navigator.share({
          text: textToSend,
        });
      } catch (err) {
        // Annulé par l'utilisateur
      }
    } else {
      // Fallback automatique sur PC : copie dans le presse-papier avec confirmation
      handleCopy(textToSend, 'share_all');
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
            /* RÉCUPÉRATION DU MOT DE PASSE PAR CODE GMAIL */
            <div className="auth-form-card">
              <div className="welcome-promoter-badge">
                <KeyRound size={14} className="text-gold" />
                <span>Récupération de compte</span>
              </div>

              {recoveryError && <div className="auth-error-pill">{recoveryError}</div>}
              {recoverySuccess && <div className="auth-success-pill">{recoverySuccess}</div>}

              {recoveryStep === 'request' ? (
                /* ÉTAPE A : ENVOI DU CODE SUR LE GMAIL */
                <div className="recovery-inner-col">
                  {promoter.email ? (
                    <div className="auth-notice-alert">
                      <Mail size={16} />
                      <span>
                        Cliquez ci-dessous pour recevoir un <strong>code de confirmation à 6 chiffres</strong> sur votre compte Gmail (<strong>{promoter.email}</strong>).
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="auth-notice-alert">
                        <Mail size={16} />
                        <span>
                          Saisissez votre compte Gmail pour recevoir votre <strong>code de confirmation à 6 chiffres</strong>.
                        </span>
                      </div>
                      <div className="auth-input-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                        <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '600' }}>Votre adresse Gmail :</label>
                        <input 
                          type="email" 
                          placeholder="Ex: votrecompte@gmail.com" 
                          value={recoveryEmailInput} 
                          onChange={(e) => setRecoveryEmailInput(e.target.value)} 
                          required 
                        />
                      </div>
                    </>
                  )}

                  <p className="auth-step-instruction">
                    Ce code sécurisé vous permettra de valider votre identité et de définir immédiatement votre nouveau mot de passe.
                  </p>

                  <button 
                    type="button" 
                    className="btn-promoter-primary purple"
                    onClick={handleSendRecoveryCode}
                    disabled={isSendingCode}
                  >
                    <Mail size={15} />
                    <span>{isSendingCode ? "Envoi du code en cours..." : "Envoyer le code sur mon Gmail"}</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="recovery-divider-row">
                    <span>ou</span>
                  </div>

                  {/* Fallback Google direct 1-clic */}
                  <button 
                    type="button" 
                    className="btn-google-native-select"
                    onClick={handleRecoverWithGoogle}
                    title="Vérifier instantanément avec Google"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Valider directement avec Google</span>
                  </button>

                  <a 
                    href={`https://wa.me/2290199728385?text=${encodeURIComponent("Bonjour Mr Ben, j'ai besoin d'aide pour réinitialiser mon mot de passe partenaire (Code promo: " + (promoter?.codePromo || "") + ").")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-direct-assist"
                    title="Contacter Mr Ben sur WhatsApp"
                  >
                    <MessageCircle size={15} />
                    <span>Besoin d'aide ? Écrire à Mr Ben</span>
                  </a>

                  <button 
                    type="button" 
                    className="btn-promoter-link"
                    onClick={() => { setIsRecovering(false); setRecoveryError(''); setRecoverySuccess(''); }}
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                /* ÉTAPE B : SAISIE DU CODE REÇU & NOUVEAU MOT DE PASSE */
                <form onSubmit={handleConfirmResetCode} className="auth-inner-form">
                  <div className="auth-notice-alert green">
                    <CheckCircle2 size={16} />
                    <span>
                      Code envoyé sur <strong>{maskedGmail || promoter.email}</strong>. Consultez vos e-mails Gmail (et dossier spams).
                    </span>
                  </div>

                  <div className="auth-input-group">
                    <label>Code de confirmation à 6 chiffres :</label>
                    <div className="input-code-wrapper">
                      <input 
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="Ex: 749201"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-otp-field"
                        required
                        autoFocus
                      />
                    </div>
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

                  <button 
                    type="submit" 
                    className="btn-promoter-primary purple"
                    disabled={isVerifyingCode}
                  >
                    <span>{isVerifyingCode ? "Validation du code..." : "Confirmer le code & Enregistrer"}</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="resend-code-row">
                    <button 
                      type="button" 
                      className="btn-resend-link"
                      onClick={handleSendRecoveryCode}
                      disabled={isSendingCode}
                    >
                      {isSendingCode ? "Envoi en cours..." : "Renvoyer un nouveau code"}
                    </button>
                  </div>

                  <button 
                    type="button" 
                    className="btn-promoter-link"
                    onClick={() => { setIsRecovering(false); setRecoveryStep('request'); setRecoveryError(''); setRecoverySuccess(''); }}
                  >
                    Annuler et retourner
                  </button>
                </form>
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
                  className="btn-share-trigger"
                  onClick={() => {
                    if (!customShareMessage) {
                      setCustomShareMessage(activeTemplate.message);
                    }
                    setIsShareModalOpen(true);
                  }}
                  title="Partager sur tous vos réseaux (WhatsApp, Facebook, TikTok, etc.)"
                >
                  <Share2 size={15} />
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

      {/* MODAL DE PERSONNALISATION ET DE PARTAGE DU MESSAGE PROMOTEUR */}
      {isShareModalOpen && (
        <div className="promoter-share-modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
          <div className="promoter-share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div className="share-modal-title-box">
                <div className="share-modal-badge-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="share-modal-title">Personnaliser & Partager mon lien</h3>
                  <p className="share-modal-subtitle">
                    Choisissez un modèle vendeur ou modifiez le texte à votre guise avant de l'envoyer.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-share-modal-close"
                onClick={() => setIsShareModalOpen(false)}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {/* SÉLECTEUR DE MODÈLES DE MESSAGES */}
            <div className="share-templates-section">
              <label className="share-section-label">Modèles de messages prêts à l'emploi :</label>
              <div className="share-templates-pills">
                {shareTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`share-template-pill ${selectedTemplateId === t.id ? 'active' : ''}`}
                    onClick={() => handleSelectTemplate(t.id)}
                  >
                    <span className="pill-title">{t.title}</span>
                    <span className="pill-badge">{t.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ZONE D'ÉDITION DU MESSAGE PERSONNALISÉ */}
            <div className="share-editor-section">
              <div className="share-editor-header">
                <label htmlFor="customShareTextarea" className="share-section-label">
                  Votre message (100% modifiable par vous) :
                </label>
                <button
                  type="button"
                  className="btn-reset-template"
                  onClick={handleResetTemplate}
                  title="Revenir au texte initial du modèle"
                >
                  <RotateCcw size={12} />
                  <span>Rétablir le modèle</span>
                </button>
              </div>

              <textarea
                id="customShareTextarea"
                className="share-editor-textarea"
                rows={7}
                value={activeMessage}
                onChange={(e) => setCustomShareMessage(e.target.value)}
                placeholder="Écrivez ou adaptez votre message de promotion ici..."
              />

              <div className="share-editor-footer">
                <div className="share-hint-note">
                  <CheckCircle2 size={13} className="text-emerald" />
                  <span>Code <strong>{promoter?.codePromo}</strong> et lien de réduction inclus.</span>
                </div>
                <span className="char-count">{activeMessage.length} caractères</span>
              </div>
            </div>

            {/* BOUTONS D'ACTION DE PARTAGE */}
            <div className="share-modal-actions-grid">
              <button
                type="button"
                className="btn-share-action primary-share"
                onClick={() => handleShareNative(activeMessage)}
                title="Partager sur tous vos réseaux sociaux (WhatsApp, TikTok, Facebook, etc.)"
              >
                <Share2 size={16} />
                <span>Partager</span>
              </button>

              <button
                type="button"
                className={`btn-share-action secondary ${copiedItem === 'share_full_text' ? 'copied' : ''}`}
                onClick={() => handleCopy(activeMessage, 'share_full_text')}
              >
                {copiedItem === 'share_full_text' ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
                <span>{copiedItem === 'share_full_text' ? 'Texte copié !' : 'Copier tout le texte'}</span>
              </button>

              <button
                type="button"
                className={`btn-share-action secondary ${copiedItem === 'share_link_only' ? 'copied' : ''}`}
                onClick={() => handleCopy(referralLink, 'share_link_only')}
              >
                {copiedItem === 'share_link_only' ? <Check size={15} className="text-emerald" /> : <Tag size={15} />}
                <span>{copiedItem === 'share_link_only' ? 'Lien copié !' : 'Copier le lien seul'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromoterPortal;
