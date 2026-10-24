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
  Key,
  Tag,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { analyticsService } from '../services/analyticsService';
import { CREATOR_PROFILE } from '../data/servicesData';
import './CheckoutModal.css';

// Icône officielle WhatsApp
function WhatsAppIcon({ size = 26 }) {
  return (
    <svg className="channel-svg-whatsapp" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// Icône officielle Gmail
function GmailIcon({ size = 26 }) {
  return (
    <svg className="channel-svg-gmail" viewBox="0 0 24 24" width={size} height={size}>
      <path fill="#4285F4" d="M2.5 5.5V18.5C2.5 19.33 3.17 20 4 20H6V10.5L2.5 7.88V5.5Z"/>
      <path fill="#34A853" d="M18 20H20C20.83 20 21.5 19.33 21.5 18.5V5.5L18 10.5V20Z"/>
      <path fill="#EA4335" d="M18 4H6L12 9L18 4Z"/>
      <path fill="#FBBC05" d="M2.5 5.5L6 10.5V4H4C3.17 4 2.5 4.67 2.5 5.5Z"/>
      <path fill="#C5221F" d="M18 4V10.5L21.5 5.5C21.5 4.67 20.83 4 20 4H18Z"/>
    </svg>
  );
}

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
  const bookPrice = storageService.getFormationPrice(activeBook?.id) || activeBook?.price || (isVideo ? 3100 : 2500);

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

  // Code Promo Réduction Partenaire
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    try {
      const detectedCode = storageService.detectAndSavePromoFromUrl();
      if (detectedCode) {
        const res = storageService.validatePromoCode(detectedCode, activeBook.id);
        if (res.valid) {
          setAppliedPromo(res);
          setPromoInput(detectedCode.toUpperCase());
        }
      }
    } catch {}
  }, [activeBook?.id]);

  const handleApplyPromo = async (e) => {
    if (e) e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError("Veuillez saisir un code promo.");
      return;
    }
    const clean = promoInput.trim().toUpperCase();
    let res = storageService.validatePromoCode(clean, activeBook.id);
    
    // Si non trouvé dans le cache local, tenter une synchronisation cloud Hostinger
    if (!res.valid) {
      await storageService.initCloudSync();
      res = storageService.validatePromoCode(clean, activeBook.id);
    }

    if (res.valid) {
      setAppliedPromo(res);
      setPromoError('');
      storageService.setPendingPromoCode(clean);
    } else {
      setPromoError(res.message || "Code promo invalide.");
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
    storageService.clearPendingPromoCode();
  };

  const payablePrice = appliedPromo ? appliedPromo.finalPrice : bookPrice;

  // Affichage du message d'option en cours d'implémentation & contact direct
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const handleOpenWhatsAppPayment = () => {
    analyticsService.trackWhatsAppClick(activeBook?.id || 'achat-whatsapp');
    const whatsappNumber = CREATOR_PROFILE.whatsappNumber || "2290199728385";
    const formattedPrice = payablePrice.toLocaleString();
    const text = encodeURIComponent(
      `Bonjour Mr Ben, je souhaite débloquer la formation « ${activeBook.title} » (${formattedPrice} FCFA).\nMon compte Gmail vérifié : ${selectedGmail}\nComment puis-je effectuer le paiement pour recevoir mon code d'accès ?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handleOpenGmailPayment = () => {
    const email = CREATOR_PROFILE.email || "mrbenofficiel6@gmail.com";
    const formattedPrice = payablePrice.toLocaleString();
    const subject = encodeURIComponent(`Achat Formation ${activeBook.title} - ${selectedGmail}`);
    const body = encodeURIComponent(
      `Bonjour Mr Ben,\n\nJe souhaite débloquer la formation « ${activeBook.title} » (${formattedPrice} FCFA).\nMon compte Gmail vérifié : ${selectedGmail}\n\nMerci de m'indiquer la démarche pour effectuer le paiement et recevoir mon code d'accès personnel.`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleInitiatePayment = () => {
    setShowPaymentNotice(true);
  };

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
          amount: Math.round(Number(payablePrice) || 2500),
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
                  amount: payablePrice,
                  promoCode: appliedPromo ? appliedPromo.promoter.codePromo : null,
                  discountAmount: appliedPromo ? appliedPromo.discountAmount : 0
                });

                if (appliedPromo?.promoter?.codePromo) {
                  storageService.recordPromoSale(appliedPromo.promoter.codePromo, {
                    bookId: activeBook.id,
                    bookTitle: activeBook.title,
                    buyerName: selectedGmail.split('@')[0],
                    buyerEmail: selectedGmail,
                    orderId: order?.id || '',
                    paidAmount: payablePrice
                  });
                }

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

  // Simulation instantanée de paiement réussi (Mode Test / Démo sans carte ni mobile money)
  const handleSimulatePaymentSuccess = () => {
    setPaymentError('');
    setIsProcessingPayment(true);
    setStep('verifying');
    setVerificationProgress(35);

    setTimeout(() => {
      setVerificationProgress(75);
      setTimeout(() => {
        setVerificationProgress(100);

        const order = storageService.createOrder({
          clientName: (selectedGmail || 'client.test').split('@')[0],
          clientEmail: selectedGmail || 'testeur@mrben.bj',
          clientPhone: '+229 97 00 00 01 (Test)',
          itemId: activeBook.id,
          itemTitle: activeBook.title,
          amount: payablePrice,
          promoCode: appliedPromo ? appliedPromo.promoter.codePromo : null,
          discountAmount: appliedPromo ? appliedPromo.discountAmount : 0
        });

        if (appliedPromo?.promoter?.codePromo) {
          storageService.recordPromoSale(appliedPromo.promoter.codePromo, {
            bookId: activeBook.id,
            bookTitle: activeBook.title,
            buyerName: (selectedGmail || 'client.test').split('@')[0],
            buyerEmail: selectedGmail || 'testeur@mrben.bj',
            orderId: order?.id || '',
            paidAmount: payablePrice
          });
        }

        storageService.setLoggedInGmail(selectedGmail || 'testeur@mrben.bj');
        setCompletedOrder(order);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        setTimeout(() => {
          setIsProcessingPayment(false);
          setStep('unlocked_showcase');
          if (onSuccess) onSuccess(order);
        }, 600);
      }, 600);
    }, 500);
  };

  // 5. Validation sécurisée d'un code d'accès accordé par Mr Ben
  const handleRedeemAccessCode = async (e) => {
    if (e) e.preventDefault();
    setCodeError('');
    if (!inputAccessCode.trim()) {
      setCodeError("Veuillez saisir votre code d'accès.");
      return;
    }

    setIsVerifyingCodeInput(true);

    try {
      const res = await storageService.unlockWithCodeAsync(inputAccessCode, activeBook.id, selectedGmail);
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
    } catch {
      setIsVerifyingCodeInput(false);
      setCodeError("Erreur technique lors de la vérification. Veuillez réessayer.");
    }
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
              {appliedPromo ? (
                <div className="clean-price-pill with-discount">
                  <div className="discount-prices-flex">
                    <span className="price-struck">{appliedPromo.originalPrice.toLocaleString()} FCFA</span>
                    <strong className="discounted-price">{appliedPromo.finalPrice.toLocaleString()} FCFA</strong>
                  </div>
                  <span className="savings-tag">Économie : -{appliedPromo.discountAmount.toLocaleString()} FCFA (-{appliedPromo.reductionPct}%)</span>
                </div>
              ) : (
                <div className="clean-price-pill">
                  <strong>{bookPrice.toLocaleString()} FCFA</strong>
                  <span>• Accès à Vie</span>
                </div>
              )}

              {/* Saisie ou badge de Code Promo */}
              <div className="checkout-promo-box">
                {!appliedPromo ? (
                  <form onSubmit={handleApplyPromo} className="checkout-promo-input-row">
                    <Tag size={13} className="promo-input-glyph" />
                    <input 
                      type="text" 
                      placeholder="Code promo (ex: ALEX15)"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      className="checkout-promo-input"
                    />
                    <button type="submit" className="btn-checkout-apply-promo">
                      Appliquer
                    </button>
                  </form>
                ) : (
                  <div className="checkout-promo-applied-badge">
                    <div className="promo-applied-text">
                      <CheckCircle2 size={13} className="text-green" />
                      <span>Code <strong>{appliedPromo.promoter.codePromo}</strong> appliqué (-{appliedPromo.reductionPct}%)</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-checkout-remove-promo"
                      onClick={handleRemovePromo}
                      title="Retirer ce code"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {promoError && <div className="checkout-promo-error">{promoError}</div>}
              </div>
            </div>

            {paymentError && (
              <div className="otp-error-banner" style={{ margin: '14px 0 6px 0', padding: '10px 14px' }}>
                <AlertCircle size={15} />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Bouton de confirmation épuré */}
            {!isEnteringCode ? (
              showPaymentNotice ? (
                <div className="payment-pending-card flow-fade-in">
                  <div className="payment-pending-badge">
                    <Clock size={13} className="pending-badge-icon" />
                    <span>Paiement en ligne direct en cours d'implémentation</span>
                  </div>

                  <p className="payment-pending-desc">
                    Cette option est en cours d'implémentation. Pour débloquer votre formation immédiatement, écrivez-nous directement sur <strong>WhatsApp</strong> ou <strong>Gmail</strong> pour effectuer votre paiement et recevoir votre code d'accès personnel :
                  </p>

                  {/* Juste les deux icônes cliquables des moyens de paiement / contact */}
                  <div className="payment-direct-icons-group">
                    <button
                      type="button"
                      className="btn-channel-icon-circle channel-whatsapp"
                      onClick={handleOpenWhatsAppPayment}
                      title="Écrire sur WhatsApp pour régler et recevoir le code"
                      aria-label="Contacter sur WhatsApp"
                    >
                      <WhatsAppIcon size={28} />
                    </button>

                    <button
                      type="button"
                      className="btn-channel-icon-circle channel-gmail"
                      onClick={handleOpenGmailPayment}
                      title="Écrire par Gmail pour régler et recevoir le code"
                      aria-label="Contacter par Gmail"
                    >
                      <GmailIcon size={28} />
                    </button>
                  </div>

                  <div className="payment-pending-footer-actions">
                    <button
                      type="button"
                      className="btn-enter-received-code"
                      onClick={() => {
                        setIsEnteringCode(true);
                        setShowPaymentNotice(false);
                        setCodeError('');
                        setInputAccessCode('');
                      }}
                    >
                      <Key size={13} />
                      <span>J'ai déjà reçu mon code d'accès</span>
                    </button>

                    <button
                      type="button"
                      className="btn-pending-back"
                      onClick={() => setShowPaymentNotice(false)}
                    >
                      ← Retour
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn-confirm-payment-clean"
                    onClick={handleInitiatePayment}
                  >
                    <span>Payer {payablePrice.toLocaleString()} FCFA</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="fedapay-security-pill">
                    <ShieldCheck size={13} />
                    <span>Règlement sécurisé • Accès immédiat par code unique</span>
                  </div>

                  <div className="checkout-aux-actions">
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
                      <span>J'ai déjà un code d'accès</span>
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="redeem-code-card flow-fade-in">
                <div className="redeem-code-header">
                  <div className="redeem-key-icon">
                    <Key size={16} />
                  </div>
                  <div className="redeem-text-col">
                    <h4 className="redeem-title">Débloquer avec un code VIP offert</h4>
                    <p className="redeem-desc">
                      Entrez votre code d'accès offert par Mr Ben pour débloquer immédiatement sans paiement
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
