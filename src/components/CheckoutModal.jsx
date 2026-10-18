import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  BookOpen,
  Mail,
  ShieldCheck,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import './CheckoutModal.css';

// Icône officielle Google G aux 4 couleurs
function GoogleGIcon() {
  return (
    <svg className="google-official-icon" viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  );
}

export function CheckoutModal({ item, book, onClose, onSuccess, onOpenTraining }) {
  const activeBook = item || book || { id: 'livre-bd-storytelling', title: "L'Art du Storytelling & BD avec l'IA", price: 2500 };

  const isVideo = activeBook?.id === 'livre-videos-ia';
  const bookCover = isVideo ? '/books/book_video_cover.png?v=2' : '/books/book_bd_cover.png';
  const bookPrice = activeBook?.price || (isVideo ? 3100 : 2500);

  // Liste des comptes vérifiés sur cet appareil
  const [accounts, setAccounts] = useState(() => storageService.getGoogleAccounts());

  // États du flux : 'select_account' | 'add_account' | 'verify_code' | 'payment' | 'verifying' | 'unlocked_showcase'
  const [step, setStep] = useState(() => {
    if (storageService.isBookUnlocked(activeBook.id)) {
      return 'unlocked_showcase';
    }
    const saved = storageService.getLoggedInGmail();
    if (saved) {
      const check = storageService.checkGmailAccess(saved, activeBook.id);
      if (check.hasAccess) return 'unlocked_showcase';
    }
    const initialAccounts = storageService.getGoogleAccounts();
    return initialAccounts.length > 0 ? 'select_account' : 'add_account';
  });

  const [selectedGmail, setSelectedGmail] = useState(() => storageService.getLoggedInGmail() || '');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Saisie manuelle d'un code d'accès accordé par Mr Ben
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [inputAccessCode, setInputAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isVerifyingCodeInput, setIsVerifyingCodeInput] = useState(false);



  // Étape de confirmation du code à 6 chiffres
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Bannière de simulation de notification Gmail réaliste
  const [gmailNotification, setGmailNotification] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Références pour les 6 champs OTP
  const otpInputRefs = useRef([]);

  // Timer de renvoi du code
  useEffect(() => {
    let interval = null;
    if (step === 'verify_code' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Écouteur de secours pour fermer instantanément le guichet FedaPay si la touche Échap est pressée
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 'Escape') {
        const fedapayElements = document.querySelectorAll(
          '#fedapay-checkout-container, .fedapay-dialog, iframe[src*="fedapay"], div[id*="fedapay"]'
        );
        if (fedapayElements.length > 0) {
          fedapayElements.forEach(el => {
            try { el.remove(); } catch {}
          });
          setIsProcessingPayment(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Validation d'une adresse e-mail stricte
  const validateEmailFormat = (email) => {
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!clean) return "Veuillez saisir votre adresse e-mail.";
    if (!regex.test(clean)) return "Format d'e-mail invalide. Exemple : nom@gmail.com";
    return "";
  };

  // 1. Demande d'envoi du code de confirmation Gmail
  const handleSendVerificationCode = (e) => {
    if (e) e.preventDefault();
    setEmailError('');

    const error = validateEmailFormat(emailInput);
    if (error) {
      setEmailError(error);
      return;
    }

    setIsSendingCode(true);

    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const result = storageService.sendGmailVerificationCode(cleanEmail);

      setIsSendingCode(false);
      setPendingEmail(cleanEmail);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setResendTimer(45);
      setCanResend(false);
      setStep('verify_code');

      // Déclenche la notification réaliste de réception du code
      setGmailNotification({
        email: cleanEmail,
        code: result.code,
        time: 'À l\'instant'
      });

      // Focus sur la première case de code
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 200);
    }, 450);
  };

  // Renvoyer un nouveau code
  const handleResendCode = () => {
    if (!pendingEmail) return;
    setOtpError('');
    const result = storageService.sendGmailVerificationCode(pendingEmail);
    setResendTimer(45);
    setCanResend(false);
    setGmailNotification({
      email: pendingEmail,
      code: result.code,
      time: 'À l\'instant'
    });
  };

  // Gestion de la saisie d'un chiffre dans les cases OTP
  const handleOtpChange = (index, value) => {
    setOtpError('');
    // Nettoyer pour ne garder que les chiffres
    const cleanNumbers = value.replace(/\D/g, '');
    if (!cleanNumbers) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Si l'utilisateur a collé ou tapé plusieurs chiffres d'un coup
    if (cleanNumbers.length > 1) {
      const newDigits = [...otpDigits];
      const chars = cleanNumbers.slice(0, 6 - index).split('');
      chars.forEach((c, i) => {
        if (index + i < 6) newDigits[index + i] = c;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + chars.length, 5);
      if (otpInputRefs.current[nextIdx]) {
        otpInputRefs.current[nextIdx].focus();
      }
      if (newDigits.every(d => d !== '')) {
        handleValidateOtp(newDigits.join(''));
      }
      return;
    }

    const cleanVal = cleanNumbers.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-focus sur la case suivante si un chiffre a été tapé
    if (cleanVal && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }

    // Si tous les chiffres sont remplis, valider automatiquement
    if (cleanVal && index === 5 && newDigits.every(d => d !== '')) {
      handleValidateOtp(newDigits.join(''));
    }
  };

  // Gestion du retour arrière (Backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  // Gestion du collage (Paste) d'un code entier
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    if (pasteData.length === 6) {
      handleValidateOtp(pasteData);
    } else {
      const nextIndex = Math.min(pasteData.length, 5);
      if (otpInputRefs.current[nextIndex]) {
        otpInputRefs.current[nextIndex].focus();
      }
    }
  };

  // Remplissage automatique depuis la bannière de notification
  const handleAutoFillFromNotification = (code) => {
    const digits = code.split('').slice(0, 6);
    setOtpDigits(digits);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    handleValidateOtp(code);
  };

  // 2. Validation du code à 6 chiffres
  const handleValidateOtp = (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length < 6) {
      setOtpError("Veuillez entrer les 6 chiffres du code de confirmation.");
      return;
    }

    setIsVerifyingCode(true);
    setOtpError('');

    setTimeout(() => {
      const result = storageService.verifyGmailCode(pendingEmail, fullCode);
      setIsVerifyingCode(false);

      if (!result.success) {
        setOtpError(result.message || "Code incorrect. Veuillez vérifier les 6 chiffres reçus.");
        return;
      }

      // Succès ! Le compte est vérifié
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch {}

      // Mettre à jour la liste des comptes
      const updatedAccounts = storageService.getGoogleAccounts();
      setAccounts(updatedAccounts);
      setSelectedGmail(pendingEmail);
      setGmailNotification(null);

      // Vérifier si ce compte a déjà réglé la formation
      const check = storageService.checkGmailAccess(pendingEmail, activeBook.id);
      if (check.hasAccess) {
        setCompletedOrder(check.order);
        setStep('unlocked_showcase');
      } else {
        setStep('payment');
      }
    }, 400);
  };

  // Connexion officielle Google OAuth 2.0 (ouvre la vraie fenêtre Google de votre navigateur)
  const handleGoogleSignInOfficial = () => {
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      alert("Identifiant Client Google manquant dans .env");
      return;
    }

    if (window.google?.accounts?.oauth2) {
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
                  const name = userData.name || userData.email.split('@')[0];
                  handleAccountAuthenticated(userData.email, name);
                }
              } catch (e) {
                console.error("Erreur récupération profil Google:", e);
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error("Erreur Google OAuth:", err);
      }
    } else {
      // Redirection popup OAuth standard
      const redirectUri = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;
      window.open(authUrl, 'GoogleSignIn', 'width=500,height=600');
    }
  };

  const handleAccountAuthenticated = (email, name) => {
    const cleanEmail = email.trim().toLowerCase();
    setSelectedGmail(cleanEmail);
    storageService.setLoggedInGmail(cleanEmail);
    storageService.addGoogleAccount(cleanEmail, name || cleanEmail.split('@')[0]);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const updated = storageService.getGoogleAccounts();
    setAccounts(updated);

    const check = storageService.checkGmailAccess(cleanEmail, activeBook.id);
    if (check.hasAccess) {
      setCompletedOrder(check.order);
      setStep('unlocked_showcase');
    } else {
      setStep('payment');
    }
  };



  // 3. Sélection directe d'un compte déjà vérifié (aucun code requis pour la prochaine fois !)
  const handleSelectVerifiedAccount = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    setSelectedGmail(cleanEmail);
    storageService.setLoggedInGmail(cleanEmail);

    const check = storageService.checkGmailAccess(cleanEmail, activeBook.id);
    if (check.hasAccess) {
      setCompletedOrder(check.order);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      setStep('unlocked_showcase');
    } else {
      setStep('payment');
    }
  };

  // Supprimer un compte vérifié de la liste
  const handleRemoveAccount = (emailToDelete, e) => {
    e.stopPropagation();
    const updated = storageService.removeGoogleAccount(emailToDelete);
    setAccounts(updated);
    if (updated.length === 0) {
      setStep('add_account');
    }
  };

  // Réinitialiser tous les comptes et recommencer à zéro
  const handleResetAll = () => {
    storageService.resetAllAccounts();
    setAccounts([]);
    setSelectedGmail('');
    setCompletedOrder(null);
    setEmailInput('');
    setOtpDigits(['', '', '', '', '', '']);
    setGmailNotification(null);
    setStep('add_account');
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // 4. Lancement du paiement RÉEL FedaPay (Mobile Money MTN, Moov, Wave, Cartes bancaires)
  const handleConfirmPayment = async () => {
    setPaymentError('');
    setIsProcessingPayment(true);

    const fedapayKey = import.meta.env?.VITE_FEDAPAY_PUBLIC_KEY || 'pk_live_2qqHt1RLs2WwN4Wf9sXvwU6u';

    try {
      // S'assurer que le SDK FedaPay est bien chargé
      let fedapay = window.FedaPay;
      if (!fedapay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
          script.onload = () => resolve(window.FedaPay);
          script.onerror = reject;
          document.head.appendChild(script);
        });
        fedapay = window.FedaPay;
      }

      if (!fedapay) {
        setIsProcessingPayment(false);
        setPaymentError("Impossible de charger le guichet de paiement. Vérifiez votre connexion internet.");
        return;
      }

      const isLiveKey = fedapayKey.startsWith('pk_live');

      const customerPayload = {
        email: selectedGmail,
        lastname: selectedGmail.split('@')[0],
        firstname: 'Client'
      };

      const widget = fedapay.init({
        public_key: fedapayKey,
        environment: isLiveKey ? 'live' : 'sandbox',
        transaction: {
          amount: Math.round(Number(bookPrice) || 2500),
          description: `Formation Mr Ben : ${activeBook.title}`
        },
        currency: {
          iso: 'XOF'
        },
        customer: customerPayload,
        onComplete: (resp) => {
          setIsProcessingPayment(false);
          const FP = window.FedaPay || fedapay;
          const isSuccess = resp && (
            resp.reason === 'CHECKOUT_COMPLETED' || 
            resp.reason === FP?.CHECKOUT_COMPLETED || 
            resp.status === 'approved' ||
            resp.reason === 'approved'
          );

          if (isSuccess) {
            // Paiement réel validé avec succès !
            setStep('verifying');
            setVerificationProgress(35);

            setTimeout(() => {
              setVerificationProgress(75);
              setTimeout(() => {
                setVerificationProgress(100);

                const order = storageService.createOrder({
                  clientName: selectedGmail.split('@')[0],
                  clientEmail: selectedGmail,
                  clientPhone: resp.transaction?.customer?.phone_number || '',
                  itemId: activeBook.id,
                  itemTitle: activeBook.title,
                  amount: bookPrice
                });

                storageService.setLoggedInGmail(selectedGmail);
                setCompletedOrder(order);

                try {
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                  });
                } catch {}

                setTimeout(() => {
                  setStep('unlocked_showcase');
                  if (onSuccess) onSuccess(order);
                }, 600);
              }, 600);
            }, 500);

          } else if (resp && resp.reason === FP.DIALOG_DISMISSED) {
            console.log("Fenêtre de paiement fermée par le client.");
          }
        }
      });

      widget.open();
    } catch (err) {
      console.error("Erreur lors de l'ouverture FedaPay:", err);
      setIsProcessingPayment(false);
      setPaymentError("Erreur d'initialisation du paiement FedaPay. Veuillez réessayer.");
    }
  };

  // 5. Validation sécurisée d'un code d'accès accordé par Mr Ben
  const handleRedeemAccessCode = (e) => {
    if (e) e.preventDefault();
    setCodeError('');
    if (!inputAccessCode.trim()) {
      setCodeError("Veuillez saisir votre code d'accès.");
      return;
    }

    setIsVerifyingCodeInput(true);

    setTimeout(() => {
      const res = storageService.unlockWithCode(inputAccessCode, activeBook.id, selectedGmail);
      setIsVerifyingCodeInput(false);

      if (res.success) {
        setCompletedOrder(res.order);
        try {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch {}

        setIsEnteringCode(false);
        setStep('unlocked_showcase');
        if (onSuccess) onSuccess(res.order);
      } else {
        setCodeError(res.message);
      }
    }, 450);
  };

  // Clic pour ouvrir la formation
  const handleStartTraining = () => {
    if (onOpenTraining) {
      onOpenTraining(activeBook, completedOrder);
    }
  };

  return (
    <div className="flow-modal-overlay" onClick={onClose}>
      <div 
        className={`flow-modal-container ${step === 'unlocked_showcase' ? 'showcase-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Petite croix rouge épurée pour fermer */}
        <button className="flow-close-red-cross" onClick={onClose} aria-label="Fermer" title="Fermer">
          ✕
        </button>

        {/* ====================================================================
            ÉTAPE 1 : CHOISIR UN COMPTE GMAIL DÉJÀ VÉRIFIÉ (SANS RETAPER LE CODE !)
            ==================================================================== */}
        {step === 'select_account' && (
          <div className="flow-card-content flow-fade-in">
            <div className="clean-top-meta">
              <h2 className="clean-modal-title">{activeBook.title}</h2>
              <div className="clean-price-pill">
                <strong>{bookPrice.toLocaleString()} FCFA</strong>
                <span>• Accès à Vie</span>
              </div>
            </div>

            <div className="account-chooser-header">
              <GoogleGIcon />
              <h3 className="chooser-title">Vos comptes Gmail</h3>
              <p className="chooser-subtitle">
                Sélectionnez votre compte vérifié pour continuer :
              </p>
            </div>

            {/* Liste de tous les comptes vérifiés */}
            <div className="verified-accounts-list">
              {accounts.map((acc, idx) => (
                <div 
                  key={acc.email}
                  className="verified-account-row"
                  onClick={() => handleSelectVerifiedAccount(acc.email)}
                  title={`Continuer avec ${acc.email} (déjà vérifié)`}
                >
                  <div className={`verified-avatar-circle avatar-color-${idx % 4}`}>
                    {acc.avatar || acc.email[0].toUpperCase()}
                  </div>
                  <div className="verified-account-details">
                    <span className="verified-account-email">{acc.email}</span>
                    <span className="verified-badge-tag">
                      <ShieldCheck size={12} />
                      <span>Compte vérifié</span>
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="btn-delete-account-row"
                    onClick={(e) => handleRemoveAccount(acc.email, e)}
                    title="Supprimer ce compte de cet appareil"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ArrowRight size={15} className="account-row-arrow" />
                </div>
              ))}
            </div>

            {/* Bouton pour ajouter un autre compte avec vérification par code */}
            <div className="account-chooser-actions">
              <button 
                type="button"
                className="btn-add-another-account"
                onClick={handleGoogleSignInOfficial}
              >
                <Plus size={15} />
                <span>Ajouter un autre compte Google</span>
              </button>

              <button 
                type="button"
                className="btn-reset-everything-link"
                onClick={handleResetAll}
                title="Effacer tous les comptes enregistrés et recommencer à zéro"
              >
                Effacer tous les comptes & recommencer à zéro
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            ÉTAPE 2 : AJOUTER UN COMPTE GMAIL (VÉRIFICATION STRICTE)
            ==================================================================== */}
        {step === 'add_account' && (
          <div className="flow-card-content flow-fade-in">
            <div className="clean-top-meta">
              <h2 className="clean-modal-title">{activeBook.title}</h2>
              <div className="clean-price-pill">
                <strong>{bookPrice.toLocaleString()} FCFA</strong>
                <span>• Accès à Vie</span>
              </div>
            </div>

            <div className="account-chooser-header">
              <h3 className="chooser-title">Authentification Google</h3>
              <p className="chooser-subtitle">
                Connectez-vous en un clic avec votre compte Google pour associer et sécuriser votre formation à vie.
              </p>
            </div>

            {/* BOUTON OFFICIEL GOOGLE OAUTH 2.0 RÉEL */}
            <div className="google-official-btn-wrapper">
              <button 
                type="button" 
                className="btn-google-sign-in"
                onClick={handleGoogleSignInOfficial}
                title="Se connecter directement avec votre compte Google"
              >
                <GoogleGIcon />
                <div className="google-btn-text-col">
                  <span className="google-btn-main">Continuer avec Google</span>
                  <span className="google-btn-sub">Sélectionnez votre compte Google en 1 clic</span>
                </div>
                <ArrowRight size={16} className="google-btn-chevron" />
              </button>
            </div>

            {accounts.length > 0 && (
              <button 
                type="button" 
                className="btn-back-to-accounts"
                onClick={() => setStep('select_account')}
              >
                ← Voir mes comptes enregistrés ({accounts.length})
              </button>
            )}

            <div className="already-paid-notice">
              <span>Votre formation sera immédiatement rattachée à votre compte Google en toute sécurité.</span>
            </div>
          </div>
        )}

        {/* ====================================================================
            ÉTAPE 3 : SAISIE DU CODE DE CONFIRMATION GMAIL (6 CHIFFRES OBLIGATOIRES)
            ==================================================================== */}
        {step === 'verify_code' && (
          <div className="flow-card-content flow-fade-in">
            <div className="clean-top-meta">
              <h2 className="clean-modal-title">{activeBook.title}</h2>
            </div>

            <div className="otp-verification-header">
              <div className="otp-mail-badge">
                <Mail size={26} className="otp-badge-icon" />
              </div>
              <h3 className="chooser-title">Code de confirmation</h3>
              <p className="chooser-subtitle">
                Entrez les 6 chiffres envoyés à :
              </p>
              <div className="pending-email-pill">
                <span>{pendingEmail}</span>
                <button 
                  type="button" 
                  className="btn-change-pending-email"
                  onClick={() => {
                    setOtpError('');
                    setStep('add_account');
                  }}
                  title="Modifier l'adresse"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* 6 cases interactives pour les 6 chiffres du code */}
            <div className="otp-inputs-row" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input 
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  className={`otp-digit-box ${digit ? 'filled' : ''} ${otpError ? 'has-error' : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {otpError && (
              <div className="otp-error-banner">
                <AlertCircle size={14} />
                <span>{otpError}</span>
              </div>
            )}

            {/* Bouton de validation du code */}
            <button 
              type="button" 
              className="btn-validate-otp-primary"
              onClick={() => handleValidateOtp()}
              disabled={isVerifyingCode || otpDigits.some(d => d === '')}
            >
              {isVerifyingCode ? (
                <>
                  <Loader2 size={16} className="btn-spinner" />
                  <span>Vérification du code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Valider mon compte Gmail</span>
                </>
              )}
            </button>

            {/* Renvoi du code avec décompte */}
            <div className="resend-code-row">
              {canResend ? (
                <button 
                  type="button" 
                  className="btn-resend-active"
                  onClick={handleResendCode}
                >
                  <RefreshCw size={13} />
                  <span>Renvoyer un nouveau code par Gmail</span>
                </button>
              ) : (
                <span className="resend-countdown-text">
                  Renvoyer un code dans <strong>{resendTimer}s</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            ÉTAPE 4 : PAIEMENT ÉPURÉ (LIÉ AU GMAIL VÉRIFIÉ)
            ==================================================================== */}
        {step === 'payment' && (
          <div className="flow-card-content flow-fade-in">
            <div className="clean-top-meta">
              <div className="connected-google-pill">
                <GoogleGIcon />
                <span className="user-email-text">{selectedGmail}</span>
                <span className="pill-verified-tag">✓ Vérifié</span>
                <button 
                  type="button" 
                  className="btn-switch-account"
                  onClick={() => setStep('select_account')}
                >
                  Changer
                </button>
              </div>

              <h2 className="clean-modal-title">{activeBook.title}</h2>
              <div className="clean-price-pill">
                <strong>{bookPrice.toLocaleString()} FCFA</strong>
                <span>• Accès à Vie</span>
              </div>
            </div>

            {paymentError && (
              <div className="otp-error-banner" style={{ margin: '14px 0 6px 0', padding: '10px 14px' }}>
                <AlertCircle size={15} />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Bouton de confirmation épuré avec FedaPay */}
            {!isEnteringCode ? (
              <>
                <button 
                  type="button" 
                  className="btn-confirm-payment-clean"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 size={16} className="btn-spinner" />
                      <span>Ouverture du guichet FedaPay...</span>
                    </>
                  ) : (
                    <>
                      <span>Payer {bookPrice.toLocaleString()} FCFA</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="fedapay-security-pill">
                  <ShieldCheck size={13} />
                  <span>Passerelle officielle FedaPay • Encaissement immédiat</span>
                </div>

                <div className="has-access-code-wrapper">
                  <button
                    type="button"
                    className="btn-has-code-link"
                    onClick={() => {
                      setIsEnteringCode(true);
                      setCodeError('');
                      setInputAccessCode('');
                    }}
                  >
                    <Key size={13} />
                    <span>J'ai un code</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="redeem-code-card flow-fade-in">
                <div className="redeem-code-header">
                  <div className="redeem-key-icon">
                    <Key size={16} />
                  </div>
                  <div className="redeem-text-col">
                    <h4 className="redeem-title">Débloquer avec un code promo</h4>
                    <p className="redeem-desc">
                      Entrez le code promo de votre créateur pour débloquer cette formation avec une réduction
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRedeemAccessCode} className="redeem-form">
                  <input 
                    type="text"
                    placeholder={activeBook.id === 'livre-bd-storytelling' ? "Ex: BD-XXXX-XXXX" : "Ex: VID-XXXX-XXXX"}
                    value={inputAccessCode}
                    onChange={(e) => {
                      setInputAccessCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    className="redeem-input"
                    autoFocus
                    required
                  />

                  {codeError && (
                    <div className="otp-error-banner" style={{ margin: '8px 0', padding: '8px 12px' }}>
                      <AlertCircle size={14} />
                      <span>{codeError}</span>
                    </div>
                  )}

                  <div className="redeem-actions-row">
                    <button 
                      type="button" 
                      className="btn-redeem-back"
                      onClick={() => setIsEnteringCode(false)}
                    >
                      Retour
                    </button>
                    <button 
                      type="submit" 
                      className="btn-redeem-validate"
                      disabled={isVerifyingCodeInput || !inputAccessCode.trim()}
                    >
                      {isVerifyingCodeInput ? (
                        <>
                          <Loader2 size={14} className="btn-spinner" />
                          <span>Vérification...</span>
                        </>
                      ) : (
                        <>
                          <span>Débloquer le livre</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            ÉTAPE 4B : ANIMATION DE VÉRIFICATION EN COURS
            ==================================================================== */}
        {step === 'verifying' && (
          <div className="flow-card-content verifying-box flow-fade-in">
            <div className="verifying-spinner-wrap">
              <Loader2 size={40} className="verifying-spinner" />
            </div>
            <h3 className="verifying-title">Validation du paiement...</h3>
            <p className="verifying-desc">
              Attribution de la formation sur votre compte certifié <strong>{selectedGmail}</strong>.
            </p>

            <div className="verifying-progress-bar">
              <div 
                className="verifying-progress-fill"
                style={{ width: `${verificationProgress}%` }}
              ></div>
            </div>

            <div className="verifying-status-text">
              {verificationProgress < 50 && "Sécurisation de la transaction..."}
              {verificationProgress >= 50 && verificationProgress < 90 && "Enregistrement de votre accès à vie..."}
              {verificationProgress >= 90 && "Formation débloquée avec succès !"}
            </div>
          </div>
        )}

        {/* ====================================================================
            ÉTAPE 5 : LE GRAND LIVRE DÉBLOQUÉ EN MAJESTÉ (NE FERME PAS TOUT SEUL !)
            ==================================================================== */}
        {step === 'unlocked_showcase' && (
          <div className="flow-showcase-content flow-fade-in">
            {/* Petit badge Débloqué élégant en haut */}
            <div className="unlocked-golden-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>DÉBLOQUÉ • ACCÈS COMPLET</span>
            </div>

            {/* Titre de remerciement et titre du livre */}
            <h3 className="showcase-trust-title">Merci de nous avoir fait confiance</h3>
            <h2 className="showcase-title">{activeBook.title}</h2>

            {/* LE LIVRE SEUL EN GRAND, MAGNIFIQUE EN 3D SANS FOND PARASITE */}
            <div 
              className="showcase-book-3d-wrapper"
              onClick={handleStartTraining}
              title="Cliquer pour commencer la formation"
            >
              <div className="book-3d-glow"></div>
              <img 
                src={bookCover} 
                alt={activeBook.title} 
                className="showcase-book-3d-img"
              />
            </div>

            {/* Bouton épuré et raffiné pour ouvrir la formation */}
            <div className="showcase-actions-group">
              <button 
                type="button" 
                className="btn-start-training-clean"
                onClick={handleStartTraining}
              >
                <BookOpen size={15} />
                <span>Cliquer pour ouvrir</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
