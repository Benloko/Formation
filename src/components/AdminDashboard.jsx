import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Video, 
  Lock, 
  Search, 
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  BarChart3,
  Tag,
  RefreshCw,
  Share2,
  ArrowRight,
  Plus,
  Filter,
  CheckCircle2,
  LogOut,
  X,
  Percent,
  Gift,
  TrendingUp,
  PieChart,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Ban,
  Calculator,
  ExternalLink,
  Link2,
  Menu,
  Activity,
  Eye,
  Smartphone,
  Laptop,
  MousePointerClick,
  Radio,
  Briefcase,
  FileText,
  MessageCircle,
  CreditCard,
  Mail,
  Phone,
  KeyRound,
  RotateCcw,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { analyticsService } from '../services/analyticsService';
import './AdminDashboard.css';

export function AdminDashboard({ onClose }) {
  // Session persistée
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('mrben_admin_session') === 'active';
    } catch {
      return false;
    }
  });

  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  // Menu latéral actif : 'overview' | 'students' | 'pricing' | 'free_codes' | 'promo_codes'
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Données dynamiques
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalStudents: 0, totalOrders: 0, countBD: 0, countVideo: 0, countDuo: 0 });
  const [adminCodes, setAdminCodes] = useState([]);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [codeStatusFilter, setCodeStatusFilter] = useState('all');

  // Modales surgissantes (Fenêtres pour créer sans encombrer la page)
  const [isFreeCodeModalOpen, setIsFreeCodeModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Formulaire Code Gratuit
  const [selectedBookForCode, setSelectedBookForCode] = useState('livre-bd-storytelling');
  const [recipientNote, setRecipientNote] = useState('');
  const [modalSuccessCode, setModalSuccessCode] = useState(null);

  // Formulaire Promoteur
  const [promoterForm, setPromoterForm] = useState({
    nom: '',
    prenom: '',
    codePromo: '',
    targetBookId: 'all',
    reductionPct: '20',
    commissionPct: '50',
    whatsapp: ''
  });
  const [promoters, setPromoters] = useState(() => storageService.getAllPromoters());
  const [promoCreatedSuccess, setPromoCreatedSuccess] = useState(null);
  const [promoterError, setPromoterError] = useState('');

  // États d'action
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLinkPromoter, setCopiedLinkPromoter] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  // Tarifs des formations & Prix barrés (référence d'origine)
  const [formationPrices, setFormationPrices] = useState(() => storageService.getFormationPrices());
  const [priceInputs, setPriceInputs] = useState(() => storageService.getFormationPrices());
  const [formationOriginalPrices, setFormationOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [originalPriceInputs, setOriginalPriceInputs] = useState(() => storageService.getFormationOriginalPrices());
  const [priceSuccessMsg, setPriceSuccessMsg] = useState('');

  // Sécurité & Modification du mot de passe Administrateur
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Statistiques de visites & Analytics réels
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    kpis: { totalViews: 0, uniqueVisitors: 0, totalInteractions: 0, unlockClicks: 0, whatsappClicks: 0, demoReads: 0 },
    chartData: [],
    topCountries: [],
    devices: [],
    pagesDetail: [],
    formationButtonsDetail: [],
    recentVisits: []
  });
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  const getCountryFlag = (code) => {
    if (!code || code === 'XX') return '🌍';
    const flags = {
      'BJ': '🇧🇯', 'CI': '🇨🇮', 'SN': '🇸🇳', 'TG': '🇹🇬',
      'CM': '🇨🇲', 'FR': '🇫🇷', 'BF': '🇧🇫', 'ML': '🇲🇱',
      'NE': '🇳🇪', 'GA': '🇬🇦', 'CG': '🇨🇬', 'CD': '🇨🇩',
      'GN': '🇬🇳', 'TD': '🇹🇩', 'BE': '🇧🇪', 'CA': '🇨🇦',
      'US': '🇺🇸', 'CH': '🇨🇭', 'MA': '🇲🇦', 'TN': '🇹🇳',
      'DZ': '🇩🇿'
    };
    return flags[String(code).toUpperCase()] || '🌍';
  };

  const loadAnalytics = async (period = analyticsPeriod) => {
    setIsLoadingAnalytics(true);
    const data = await analyticsService.fetchAnalytics(period);
    if (data && data.success) {
      setAnalyticsData(data);
    }
    setIsLoadingAnalytics(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics(analyticsPeriod);
    }
  }, [isAuthenticated, analyticsPeriod]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await storageService.initCloudSync();
    setOrders(storageService.getAllOrders());
    setStats(storageService.getAdminStats());
    setAdminCodes(storageService.getAdminGeneratedCodes());
    setPromoters(storageService.getAllPromoters());
    const currentPrices = storageService.getFormationPrices();
    const currentOriginalPrices = storageService.getFormationOriginalPrices();
    setFormationPrices(currentPrices);
    setPriceInputs(currentPrices);
    setFormationOriginalPrices(currentOriginalPrices);
    setOriginalPriceInputs(currentOriginalPrices);
    await loadAnalytics(analyticsPeriod);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const handleCreatePromoter = (e) => {
    e.preventDefault();
    setPromoterError('');

    const res = storageService.createPromoter({
      nom: promoterForm.nom,
      prenom: promoterForm.prenom,
      codePromo: promoterForm.codePromo,
      whatsapp: promoterForm.whatsapp,
      targetBookId: promoterForm.targetBookId,
      reductionPct: promoterForm.reductionPct,
      commissionPct: promoterForm.commissionPct
    });

    if (res.success) {
      setPromoCreatedSuccess(res.promoter);
      setPromoterForm({
        nom: '',
        prenom: '',
        codePromo: '',
        targetBookId: 'all',
        reductionPct: '20',
        commissionPct: '50',
        whatsapp: ''
      });
      refreshData();
    } else {
      setPromoterError(res.message || "Erreur lors de la création du promoteur.");
    }
  };

  const handleTogglePromoterStatus = (promoterId) => {
    storageService.togglePromoterStatus(promoterId);
    refreshData();
  };

  const handleDeletePromoter = (promoterId, promoCode) => {
    if (window.confirm(`Supprimer définitivement le promoteur avec le code ${promoCode} ?\n\nCette action est irréversible.`)) {
      storageService.deletePromoter(promoterId);
      refreshData();
    }
  };

  const handleAdminResetPassword = async (p) => {
    const promptVal = window.prompt(
      `Réinitialisation du mot de passe pour ${p.prenom} ${p.nom} (Code: ${p.codePromo}) :\n\n- Tapez un nouveau mot de passe pour le définir maintenant (au moins 4 caractères)\n- OU laissez VIDE et validez pour remettre à zéro (le promoteur pourra en créer un nouveau à sa prochaine connexion).`,
      ""
    );
    if (promptVal === null) return;

    const newPass = promptVal.trim();
    if (newPass && newPass.length < 4) {
      alert("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    const res = await storageService.adminResetPromoterPassword(p.id, newPass);
    if (res.success) {
      alert(
        newPass
          ? `Nouveau mot de passe enregistré pour ${p.prenom} !`
          : `Compte remis à zéro ! ${p.prenom} pourra définir son mot de passe directement à sa prochaine connexion.`
      );
      refreshData();
    } else {
      alert(`Erreur : ${res.error || "Impossible de réinitialiser le mot de passe."}`);
    }
  };

  const formatPhoneNumber = (val) => {
    if (!val) return '';
    const cleaned = String(val).trim().replace(/[\s.-]+/g, '');
    if (/^229\d{10}$/.test(cleaned)) {
      return `+229 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)} ${cleaned.slice(11, 13)}`;
    }
    if (/^229\d{8}$/.test(cleaned)) {
      return `+229 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    }
    if (/^\+229\d{10}$/.test(cleaned)) {
      return `+229 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)} ${cleaned.slice(12, 14)}`;
    }
    if (/^\+229\d{8}$/.test(cleaned)) {
      return `+229 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
    if (/^\d{10}$/.test(cleaned)) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    if (/^\d{8}$/.test(cleaned)) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
    }
    return val;
  };

  const handleCopyPromoterPortalLink = (promoterItem) => {
    const portalUrl = `${window.location.origin}/#promoteur?code=${promoterItem.codePromo}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedLinkPromoter(promoterItem.id);
    setTimeout(() => setCopiedLinkPromoter(null), 2000);
  };

  const handleCopyPromoterInvitation = (promoterItem) => {
    const portalUrl = `${window.location.origin}/#promoteur?code=${promoterItem.codePromo}`;
    const text = `Bonjour ${promoterItem.prenom} !\n\nVoici votre accès partenaire officiel pour recommander les formations de Mr Ben :\n\n🎁 Votre Code Promo : *${promoterItem.codePromo}*\n👉 Réduction pour vos contacts : -${promoterItem.reductionPct}%\n💰 Votre commission : ${promoterItem.commissionPct}% sur chaque vente !\n\n🔗 Accédez à votre Espace Partenaire privé pour suivre vos ventes et vos gains en direct :\n${portalUrl}\n\n(Lors de votre première visite, vous créerez votre mot de passe personnel pour sécuriser votre espace).`;
    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 2200);
  };

  const handlePriceInputChange = (key, value) => {
    setPriceInputs(prev => ({
      ...prev,
      [key]: value
    }));
    setPriceSuccessMsg('');
  };

  const handleOriginalPriceInputChange = (key, value) => {
    setOriginalPriceInputs(prev => ({
      ...prev,
      [key]: value
    }));
    setPriceSuccessMsg('');
  };

  const handleSavePrices = (e) => {
    if (e) e.preventDefault();
    const cleanBD = Math.max(0, parseInt(priceInputs['livre-bd-storytelling'], 10) || 0);
    const cleanVideo = Math.max(0, parseInt(priceInputs['livre-videos-ia'], 10) || 0);

    const cleanOrigBD = Math.max(cleanBD, parseInt(originalPriceInputs['livre-bd-storytelling'], 10) || cleanBD * 2);
    const cleanOrigVideo = Math.max(cleanVideo, parseInt(originalPriceInputs['livre-videos-ia'], 10) || cleanVideo * 2);

    const updated = storageService.setFormationPrices(
      {
        'livre-bd-storytelling': cleanBD,
        'livre-videos-ia': cleanVideo
      },
      {
        'livre-bd-storytelling': cleanOrigBD,
        'livre-videos-ia': cleanOrigVideo
      }
    );

    setFormationPrices(updated.prices);
    setPriceInputs(updated.prices);
    setFormationOriginalPrices(updated.originalPrices);
    setOriginalPriceInputs(updated.originalPrices);
    setPriceSuccessMsg('✅ Prix enregistrés avec succès ! Le prix barré et le tarif de vente sont appliqués partout en direct.');
    setTimeout(() => setPriceSuccessMsg(''), 5000);
  };

  const handleResetPrices = () => {
    if (window.confirm("Rétablir les tarifs par défaut ?\n\n• BD & Storytelling : 2 500 FCFA (Barré : 5 000 FCFA)\n• Vidéos IA : 3 100 FCFA (Barré : 6 000 FCFA)")) {
      const reset = storageService.resetFormationPrices();
      setFormationPrices(reset.prices);
      setPriceInputs(reset.prices);
      setFormationOriginalPrices(reset.originalPrices);
      setOriginalPriceInputs(reset.originalPrices);
      setPriceSuccessMsg('🔄 Les prix par défaut ont été rétablis avec succès.');
      setTimeout(() => setPriceSuccessMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, label: 'Faible', color: '#f87171' };
    if (score <= 4) return { level: 2, label: 'Robuste', color: '#fbbf24' };
    return { level: 3, label: 'Très sécurisé (Idéal)', color: '#34d399' };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pinCode.trim()) {
      setPinError("Veuillez saisir votre mot de passe.");
      return;
    }
    setIsVerifyingLogin(true);
    setPinError('');
    const res = await storageService.verifyAdminPassword(pinCode.trim());
    setIsVerifyingLogin(false);
    if (res.success) {
      try {
        sessionStorage.setItem('mrben_admin_session', 'active');
      } catch {}
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError(res.message || "Mot de passe incorrect.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentPasswordInput) {
      setPasswordChangeError("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (!newPasswordInput) {
      setPasswordChangeError("Veuillez saisir votre nouveau mot de passe.");
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeError("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPasswordInput === currentPasswordInput) {
      setPasswordChangeError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    setIsSubmittingPassword(true);
    const res = await storageService.updateAdminPassword(currentPasswordInput, newPasswordInput);
    setIsSubmittingPassword(false);

    if (res.success) {
      setPasswordChangeSuccess("✅ Mot de passe modifié avec succès ! Pensez à bien le conserver.");
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordChangeSuccess('');
      }, 2200);
    } else {
      setPasswordChangeError(res.message || "Erreur lors de la modification du mot de passe.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('mrben_admin_session');
    } catch {}
    setIsAuthenticated(false);
    setPinCode('');
  };

  const handleCreateFreeCode = (e) => {
    e.preventDefault();
    const created = storageService.createAdminAccessCode({
      itemId: selectedBookForCode,
      recipientName: recipientNote
    });
    setModalSuccessCode(created);
    setRecipientNote('');
    refreshData();
  };

  const handleDeleteCode = (codeId, status) => {
    const isBlocked = status === 'BLOQUÉ';
    const msg = isBlocked 
      ? "Supprimer définitivement ce code bloqué ?\n\nCette action est irréversible et le retirera définitivement du système."
      : "Supprimer ce code d'accès non utilisé ?\n\nCe code n'ayant pas encore été activé par un élève, il sera immédiatement annulé.";

    if (window.confirm(msg)) {
      const res = storageService.deleteAdminCode(codeId);
      if (res && res.success === false && res.message) {
        alert(res.message);
      }
      refreshData();
    }
  };

  const handleBlockCode = (codeId) => {
    if (window.confirm("Bloquer ce code d'accès ?\n\nL'élève qui l'utilise n'aura plus accès à la formation et sera immédiatement déconnecté.")) {
      storageService.blockAdminCode(codeId);
      refreshData();
    }
  };

  const handleUnblockCode = (codeId) => {
    if (window.confirm("Débloquer ce code d'accès ?\n\nL'accès à la formation sera rétabli pour l'élève.")) {
      storageService.unblockAdminCode(codeId);
      refreshData();
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleCopyWhatsAppMessage = (codeItem) => {
    const text = `Bonjour ! Voici votre code d'accès offert pour débloquer la formation "${codeItem.itemTitle}" sur Mr Ben :\n\n🎁 Code : ${codeItem.code}\n🔗 Accès direct : https://formation.gpower-store.com/\n\nCliquez sur "Débloquer", connectez-vous avec votre Google, et saisissez ce code. Accès immédiat et illimité !`;
    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Nom', 'Email', 'Formation', 'Montant', 'Code'];
    const rows = orders.map(o => [
      `"${o.date || ''}"`,
      `"${(o.clientName || '').replace(/"/g, '""')}"`,
      `"${(o.clientEmail || '').replace(/"/g, '""')}"`,
      `"${(o.itemTitle || '').replace(/"/g, '""')}"`,
      `"${o.amount || 0}"`,
      `"${o.code || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `eleves_mrben_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage
  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (o.clientName || '').toLowerCase().includes(term) ||
      (o.clientEmail || '').toLowerCase().includes(term) ||
      (o.code || '').toLowerCase().includes(term);
    const matchesBook = bookFilter === 'all' || o.itemId === bookFilter;
    return matchesSearch && matchesBook;
  });

  const filteredCodes = adminCodes.filter(c => {
    if (codeStatusFilter === 'available') return c.status === 'DISPONIBLE';
    if (codeStatusFilter === 'used') return c.status === 'UTILISÉ';
    if (codeStatusFilter === 'blocked') return c.status === 'BLOQUÉ';
    return true;
  });

  const availableCount = adminCodes.filter(c => c.status === 'DISPONIBLE').length;
  const usedCount = adminCodes.filter(c => c.status === 'UTILISÉ').length;
  const blockedCount = adminCodes.filter(c => c.status === 'BLOQUÉ').length;

  // Calculs du donut de répartition des formations vendues
  const totalOrdersCount = orders.length || 1;
  const bdPercent = Math.round((stats.countBD / totalOrdersCount) * 100) || 50;
  const videoPercent = 100 - bdPercent;
  const circleCircumference = 2 * Math.PI * 38; // ~238.76
  const bdStrokeDash = (bdPercent / 100) * circleCircumference;
  const videoStrokeDash = (videoPercent / 100) * circleCircumference;

  return (
    <div className="admin-app-wrapper">
      
      {!isAuthenticated ? (
        /* Écran de verrouillage épuré */
        <div className="admin-lock-screen">
          <div className="lock-modal-box">
            <div className="lock-badge-icon">
              <Lock size={20} />
            </div>
            <h2>Console d'Administration</h2>
            <p>Espace réservé à Mr Ben</p>

            {pinError && <div className="lock-error-msg">{pinError}</div>}

            <form onSubmit={handleLogin} className="lock-input-group">
              <input 
                type="password" 
                placeholder="Votre mot de passe secret"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                autoFocus
                disabled={isVerifyingLogin}
              />
              <button type="submit" className="lock-btn-submit" disabled={isVerifyingLogin}>
                {isVerifyingLogin ? (
                  <>
                    <Loader2 size={14} className="spin-icon" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <span>Ouvrir</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Layout principal SaaS : Sidebar à gauche + Vue principale à droite */
        <div className="admin-saas-layout">
          
          {/* Backdrop obscurcissant sur smartphone quand le menu est ouvert */}
          {isMobileMenuOpen && (
            <div 
              className="admin-mobile-backdrop" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          )}

          {/* ================================================================
              SIDEBAR GAUCHE (PERMANENTE SUR DESKTOP / TIROIR SUR MOBILE)
             ================================================================ */}
          <aside className={`admin-left-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            
            {/* Header Sidebar */}
            <div className="sidebar-brand-box">
              <div className="brand-logo-mark">MB</div>
              <div className="brand-text-column">
                <span className="brand-app-name">Mr Ben</span>
                <span className="brand-role-pill">Fondateur</span>
              </div>
              <button 
                type="button"
                className="btn-close-mobile-drawer"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Fermer le menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu de navigation vertical */}
            <nav className="sidebar-nav-menu">
              <span className="menu-group-label">GESTION</span>

              <button 
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                title="Vue d'ensemble et ventes"
              >
                <BarChart3 size={16} className="nav-icon" />
                <span className="nav-text">Vue d'ensemble</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
                title="Statistiques réelles, visiteurs, pays et appareils"
              >
                <Activity size={16} className="nav-icon text-sky" />
                <span className="nav-text">Statistiques & Visites</span>
                {analyticsData?.kpis?.uniqueVisitors > 0 && (
                  <span className="nav-badge pulse">{analyticsData.kpis.uniqueVisitors}</span>
                )}
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}
                title="Liste des élèves et commandes"
              >
                <Users size={16} className="nav-icon" />
                <span className="nav-text">Élèves & Inscriptions</span>
                <span className="nav-badge">{stats.totalStudents}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => { setActiveTab('pricing'); setIsMobileMenuOpen(false); }}
                title="Modifier les prix de vente des formations"
              >
                <DollarSign size={16} className="nav-icon text-gold" />
                <span className="nav-text">Tarifs & Prix</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'free_codes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('free_codes'); setIsMobileMenuOpen(false); }}
                title="Codes d'accès 100% gratuits"
              >
                <Gift size={16} className="nav-icon" />
                <span className="nav-text">Codes Gratuits (VIP)</span>
                <span className="nav-badge">{adminCodes.length}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'promo_codes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('promo_codes'); setIsMobileMenuOpen(false); }}
                title="Gestion des promoteurs et codes promo"
              >
                <Percent size={16} className="nav-icon" />
                <span className="nav-text">Codes Promo</span>
                <span className="nav-badge">{promoters.length}</span>
              </button>
            </nav>

            {/* Bas de la sidebar : statut & actions */}
            <div className="sidebar-bottom-actions">
              <div className="system-live-indicator">
                <span className="live-dot"></span>
                <span>Système en ligne</span>
              </div>

              <div className="sidebar-tools-row">
                <button 
                  className="btn-side-tool"
                  onClick={() => {
                    setPasswordChangeError('');
                    setPasswordChangeSuccess('');
                    setCurrentPasswordInput('');
                    setNewPasswordInput('');
                    setConfirmPasswordInput('');
                    setIsPasswordModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  title="Modifier le mot de passe administrateur"
                >
                  <KeyRound size={15} />
                  <span>Sécurité</span>
                </button>

                <button 
                  className="btn-side-tool"
                  onClick={handleLogout}
                  title="Déconnexion de l'administration"
                >
                  <LogOut size={15} />
                  <span>Déconnexion</span>
                </button>

                <button 
                  className="btn-side-tool gold"
                  onClick={onClose}
                  title="Retourner sur le site"
                >
                  <Globe size={15} />
                  <span>Site</span>
                </button>
              </div>
            </div>

          </aside>

          {/* ================================================================
              ZONE DE CONTENU PRINCIPALE (À DROITE / PLEIN ÉCRAN MOBILE)
             ================================================================ */}
          <main className="admin-main-viewport">
            
            {/* Top Bar avec titre et icônes d'actions rapides */}
            <header className="viewport-top-header">
              <div className="header-left-cluster">
                <button 
                  type="button"
                  className="btn-mobile-menu-toggle"
                  onClick={() => setIsMobileMenuOpen(true)}
                  title="Ouvrir le menu complet"
                >
                  <Menu size={17} />
                </button>

                <div className="header-titles">
                  <h2 className="current-section-title">
                    {activeTab === 'overview' && 'Vue d\'ensemble'}
                    {activeTab === 'analytics' && 'Statistiques & Visites Réelles'}
                    {activeTab === 'students' && 'Gestion des Élèves'}
                    {activeTab === 'pricing' && 'Tarifs & Prix'}
                    {activeTab === 'free_codes' && 'Codes Gratuits VIP'}
                    {activeTab === 'promo_codes' && 'Promoteurs & Affiliation'}
                  </h2>
                  <span className="current-section-sub">
                    {activeTab === 'overview' && `${stats.totalStudents} élève(s) • ${orders.length} commande(s)`}
                    {activeTab === 'analytics' && `${analyticsData.kpis?.totalViews || 0} visite(s) • ${analyticsData.topCountries?.length || 0} pays détecté(s)`}
                    {activeTab === 'students' && `${stats.totalStudents} élève(s) • ${filteredOrders.length} vente(s)`}
                    {activeTab === 'pricing' && 'Prix appliqués sur le site'}
                    {activeTab === 'free_codes' && 'Déblocage direct 100% gratuit'}
                    {activeTab === 'promo_codes' && 'Affiliés • 50% commission'}
                  </span>
                </div>
              </div>

              {/* Boutons d'actions rapides */}
              <div className="header-icon-actions">
                <button 
                  type="button"
                  className="btn-header-security"
                  onClick={() => {
                    setPasswordChangeError('');
                    setPasswordChangeSuccess('');
                    setCurrentPasswordInput('');
                    setNewPasswordInput('');
                    setConfirmPasswordInput('');
                    setIsPasswordModalOpen(true);
                  }}
                  title="Modifier le mot de passe administrateur"
                >
                  <ShieldCheck size={14} className="text-gold" />
                  <span>Mot de passe</span>
                </button>

                <button 
                  className={`btn-icon-only ${isRefreshing ? 'refresh-spin' : ''}`}
                  onClick={refreshData}
                  title="Actualiser les données"
                >
                  <RefreshCw size={15} />
                </button>

                {activeTab === 'students' && (
                  <button 
                    className="btn-icon-only"
                    onClick={handleExportCSV}
                    title="Télécharger la liste en CSV"
                  >
                    <Download size={15} />
                  </button>
                )}

                <button 
                  className="btn-icon-only close"
                  onClick={onClose}
                  title="Fermer la console (Retour au site)"
                >
                  <X size={15} />
                </button>
              </div>
            </header>

            {/* Contenu scrollable de l'onglet actif */}
            <div className="viewport-scroll-content">
              
              {/* ============================================================
                  ONGLET 1 : VUE D'ENSEMBLE AVEC GRAPHES PROFESSIONNELS
                 ============================================================ */}
              {activeTab === 'overview' && (
                <div className="content-tab-flow">
                  
                  {/* 4 KPIs ultra-compacts */}
                  <div className="kpi-micro-row">
                    <div className="kpi-micro-box gold">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Chiffre d'Affaires</span>
                        <div className="micro-box-icon gold"><DollarSign size={13} /></div>
                      </div>
                      <div className="micro-box-number">{stats.totalRevenue.toLocaleString()} FCFA</div>
                      <span className="micro-box-caption">Direct & Mobile Money</span>
                    </div>

                    <div className="kpi-micro-box cyan">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Élèves Inscrits</span>
                        <div className="micro-box-icon cyan"><Users size={13} /></div>
                      </div>
                      <div className="micro-box-number">{stats.totalStudents} {stats.totalStudents > 1 ? 'élèves' : 'élève'}</div>
                      <span className="micro-box-caption">{orders.length} formation(s) débloquée(s) au total</span>
                    </div>

                    <div className="kpi-micro-box purple">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Livre 1 : BD</span>
                        <div className="micro-box-icon purple"><BookOpen size={13} /></div>
                      </div>
                      <div className="micro-box-number">{stats.countBD} vente(s)</div>
                      <span className="micro-box-caption">Storytelling visuel</span>
                    </div>

                    <div className="kpi-micro-box green">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Livre 2 : Vidéos IA</span>
                        <div className="micro-box-icon green"><Video size={13} /></div>
                      </div>
                      <div className="micro-box-number">{stats.countVideo} vente(s)</div>
                      <span className="micro-box-caption">Contenu viral IA</span>
                    </div>
                  </div>

                  {/* SECTION DES GRAPHES PROFESSIONNELS (SVG Pur Ultra Fluide) */}
                  <div className="charts-double-row">
                    
                    {/* Graphe 1 : Courbe d'activité / Évolution */}
                    <div className="chart-card-box">
                      <div className="chart-card-header">
                        <div className="chart-title-wrap">
                          <TrendingUp size={16} className="text-gold" />
                          <div>
                            <h4>Tendance des Inscriptions & Activité</h4>
                            <span className="chart-subtext">Progression continue des accès</span>
                          </div>
                        </div>
                        <span className="chart-trend-tag">+100% d'activité</span>
                      </div>

                      {/* SVG Courbe graphique avec gradient lumineux */}
                      <div className="svg-chart-container">
                        <svg viewBox="0 0 500 140" className="smooth-area-chart" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="areaGoldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#e5b358" stopOpacity="0.4" />
                              <stop offset="70%" stopColor="#e5b358" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#e5b358" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#e5b358" />
                              <stop offset="50%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#fbe3a1" />
                            </linearGradient>
                          </defs>

                          {/* Lignes horizontales de repère */}
                          <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                          <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                          <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" />

                          {/* Remplissage fluide avec gradient */}
                          <path 
                            d="M 10,120 L 10,110 Q 90,115 160,85 T 310,65 T 410,35 L 490,25 L 490,120 Z" 
                            fill="url(#areaGoldGrad)" 
                          />

                          {/* Courbe principale dorée */}
                          <path 
                            d="M 10,110 Q 90,115 160,85 T 310,65 T 410,35 L 490,25" 
                            fill="none" 
                            stroke="url(#lineStrokeGrad)" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                          />

                          {/* Points interactifs sur la courbe */}
                          <circle cx="160" cy="85" r="4" fill="#090e18" stroke="#e5b358" strokeWidth="2" />
                          <circle cx="310" cy="65" r="4" fill="#090e18" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="490" cy="25" r="5" fill="#e5b358" stroke="#ffffff" strokeWidth="2" />
                        </svg>

                        {/* Axe des jours */}
                        <div className="chart-axis-days">
                          <span>Lun</span>
                          <span>Mar</span>
                          <span>Mer</span>
                          <span>Jeu</span>
                          <span>Ven</span>
                          <span>Sam</span>
                          <span className="text-gold">Aujourd'hui</span>
                        </div>
                      </div>
                    </div>

                    {/* Graphe 2 : Répartition des ventes (Donut Chart) */}
                    <div className="chart-card-box donut-side">
                      <div className="chart-card-header">
                        <div className="chart-title-wrap">
                          <PieChart size={16} className="text-purple" />
                          <div>
                            <h4>Répartition des Formations</h4>
                            <span className="chart-subtext">Livre 1 vs Livre 2</span>
                          </div>
                        </div>
                      </div>

                      <div className="donut-content-split">
                        {/* SVG Donut Ring */}
                        <div className="donut-graphic-wrap">
                          <svg viewBox="0 0 100 100" className="donut-svg">
                            {/* Cercle de fond */}
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
                            
                            {/* Segment BD (Violet) */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="transparent" 
                              stroke="#8b5cf6" 
                              strokeWidth="9" 
                              strokeDasharray={`${bdStrokeDash} ${circleCircumference}`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />

                            {/* Segment Vidéo IA (Cyan / Émeraude) */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="transparent" 
                              stroke="#10b981" 
                              strokeWidth="9" 
                              strokeDasharray={`${videoStrokeDash} ${circleCircumference}`}
                              strokeDashoffset={`-${bdStrokeDash}`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="donut-center-metric">
                            <strong>{orders.length}</strong>
                            <small>ventes</small>
                          </div>
                        </div>

                        {/* Légendes détaillées */}
                        <div className="donut-legend-stack">
                          <div className="donut-legend-item">
                            <span className="legend-color-dot purple"></span>
                            <div className="legend-text">
                              <span className="legend-label">BD & Storytelling</span>
                              <strong className="legend-val">{stats.countBD} vente(s) • {bdPercent}%</strong>
                            </div>
                          </div>

                          <div className="donut-legend-item">
                            <span className="legend-color-dot green"></span>
                            <div className="legend-text">
                              <span className="legend-label">Vidéos Virales IA</span>
                              <strong className="legend-val">{stats.countVideo} vente(s) • {videoPercent}%</strong>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Synthèse inférieure : Dernières Inscriptions & Raccourcis Modales */}
                  <div className="overview-bottom-grid">
                    
                    {/* Tableau compact des dernières inscriptions */}
                    <div className="overview-subcard">
                      <div className="subcard-header">
                        <h4>Dernières Inscriptions</h4>
                        <button className="link-subcard-btn" onClick={() => setActiveTab('students')}>
                          <span>Tout voir ({orders.length})</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      <div className="subcard-table-scroll">
                        <table className="mini-saas-table">
                          <thead>
                            <tr>
                              <th>Élève</th>
                              <th>Formation</th>
                              <th>Montant</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 4).map((ord) => (
                              <tr key={ord.id}>
                                <td>
                                  <div className="mini-user-cell">
                                    <span className="user-avatar-tag">{(ord.clientName || 'E').charAt(0).toUpperCase()}</span>
                                    <div className="user-meta-lines">
                                      <strong>{ord.clientName}</strong>
                                      <small>{ord.clientEmail}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`pill-mini-formation ${ord.itemId === 'livre-bd-storytelling' ? 'bd' : 'video'}`}>
                                    {ord.itemId === 'livre-bd-storytelling' ? 'BD' : 'Vidéos IA'}
                                  </span>
                                </td>
                                <td><strong className="amount-gold">{ord.amount ? `${ord.amount.toLocaleString()} F` : 'Offert'}</strong></td>
                                <td className="date-muted">{ord.date}</td>
                              </tr>
                            ))}
                            {orders.length === 0 && (
                              <tr>
                                <td colSpan="4" className="empty-subcard-cell">Aucune inscription enregistrée.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Actions Rapides déclenchant les Modales */}
                    <div className="overview-subcard">
                      <div className="subcard-header">
                        <h4>Création & Actions Rapides</h4>
                      </div>

                      <div className="quick-actions-column">
                        <button 
                          className="action-tile-btn gold"
                          onClick={() => {
                            setModalSuccessCode(null);
                            setIsFreeCodeModalOpen(true);
                          }}
                        >
                          <div className="tile-icon gold"><Gift size={15} /></div>
                          <div className="tile-content">
                            <strong>+ Créer un Code Gratuit (VIP)</strong>
                            <span>Ouvre une fenêtre pour générer un code 100% offert</span>
                          </div>
                          <ChevronRight size={14} className="tile-arrow" />
                        </button>

                        <button 
                          className="action-tile-btn purple"
                          onClick={() => {
                            setActiveTab('promo_codes');
                            setIsPromoModalOpen(true);
                          }}
                        >
                          <div className="tile-icon purple"><Percent size={15} /></div>
                          <div className="tile-content">
                            <strong>+ Créer un Promoteur & Code Promo</strong>
                            <span>Définir le % réduction élève et % commission partenaire</span>
                          </div>
                          <ChevronRight size={14} className="tile-arrow" />
                        </button>
                      </div>

                      <div className="status-badges-row">
                        <span className="badge-tag-online"><Check size={11} /> Google OAuth</span>
                        <span className="badge-tag-online"><Check size={11} /> FedaPay Mobile Money</span>
                        <span className="badge-tag-online"><Check size={11} /> Sauvegarde Active</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ============================================================
                  ONGLET ANALYTICS & STATISTIQUES EN DIRECT
                 ============================================================ */}
              {activeTab === 'analytics' && (
                <div className="content-tab-flow analytics-tab-flow">
                  
                  {/* Barre supérieure : Sélecteur de période & Statut Live */}
                  <div className="analytics-control-bar">
                    <div className="analytics-live-status">
                      <span className="live-pulsing-badge">
                        <Radio size={12} className="pulse-icon" />
                        <span>Tracking en Direct</span>
                      </span>
                      <span className="analytics-updated-hint">
                        {isLoadingAnalytics ? 'Mise à jour en cours...' : 'Mise à jour en temps réel'}
                      </span>
                    </div>

                    <div className="period-pills-cluster">
                      <button 
                        type="button" 
                        className={`btn-period-pill ${analyticsPeriod === 'today' ? 'active' : ''}`}
                        onClick={() => setAnalyticsPeriod('today')}
                      >
                        Aujourd'hui
                      </button>
                      <button 
                        type="button" 
                        className={`btn-period-pill ${analyticsPeriod === '7d' ? 'active' : ''}`}
                        onClick={() => setAnalyticsPeriod('7d')}
                      >
                        7 derniers jours
                      </button>
                      <button 
                        type="button" 
                        className={`btn-period-pill ${analyticsPeriod === '30d' ? 'active' : ''}`}
                        onClick={() => setAnalyticsPeriod('30d')}
                      >
                        30 jours
                      </button>
                      <button 
                        type="button" 
                        className={`btn-period-pill ${analyticsPeriod === 'all' ? 'active' : ''}`}
                        onClick={() => setAnalyticsPeriod('all')}
                      >
                        Tout
                      </button>
                    </div>
                  </div>

                  {/* 4 Cartes KPIs Minimalistes & Fintech */}
                  <div className="analytics-kpi-grid">
                    <div className="analytics-kpi-card purple">
                      <div className="kpi-card-header">
                        <span className="kpi-card-label">Visiteurs Uniques</span>
                        <div className="kpi-icon-bubble purple"><Users size={14} /></div>
                      </div>
                      <div className="kpi-card-number">{analyticsData.kpis?.uniqueVisitors || 0}</div>
                      <div className="kpi-card-sub">
                        <span>Personnes réelles ayant ouvert le site</span>
                      </div>
                    </div>

                    <div className="analytics-kpi-card sky">
                      <div className="kpi-card-header">
                        <span className="kpi-card-label">Pages Vues Totales</span>
                        <div className="kpi-icon-bubble sky"><Eye size={14} /></div>
                      </div>
                      <div className="kpi-card-number">{analyticsData.kpis?.totalViews || 0}</div>
                      <div className="kpi-card-sub">
                        <span>Fréquentation totale sur la période</span>
                      </div>
                    </div>

                    <div className="analytics-kpi-card amber">
                      <div className="kpi-card-header">
                        <span className="kpi-card-label">Interactions & Clics</span>
                        <div className="kpi-icon-bubble amber"><MousePointerClick size={14} /></div>
                      </div>
                      <div className="kpi-card-number">{analyticsData.kpis?.totalInteractions || 0}</div>
                      <div className="kpi-card-sub">
                        <span>Clics d'intérêt, déblocage & paiements</span>
                      </div>
                    </div>

                    <div className="analytics-kpi-card emerald">
                      <div className="kpi-card-header">
                        <span className="kpi-card-label">Taux d'Intérêt</span>
                        <div className="kpi-icon-bubble emerald"><TrendingUp size={14} /></div>
                      </div>
                      <div className="kpi-card-number">
                        {analyticsData.kpis?.totalViews > 0 
                          ? `${Math.min(100, Math.round(((analyticsData.kpis.totalInteractions || 0) / analyticsData.kpis.totalViews) * 100))}%`
                          : '0%'}
                      </div>
                      <div className="kpi-card-sub">
                        <span>Ratio de conversion & engagement</span>
                      </div>
                    </div>
                  </div>

                  {/* Carte Graphique Linéaire SVG Interactif */}
                  <div className="analytics-panel-card">
                    <div className="panel-card-head">
                      <div className="head-title-col">
                        <h3>Évolution de la Fréquentation</h3>
                        <p>Courbe quotidienne des visites et des visiteurs uniques</p>
                      </div>
                      <div className="chart-legend-row">
                        <span className="legend-item views"><span className="dot views"></span> Vues</span>
                        <span className="legend-item visitors"><span className="dot visitors"></span> Visiteurs</span>
                      </div>
                    </div>

                    {/* Rendu du Graphique SVG Fluide & Réactif */}
                    <div className="chart-svg-container">
                      {analyticsData.chartData && analyticsData.chartData.length > 0 ? (() => {
                        const data = analyticsData.chartData;
                        const maxVal = Math.max(5, ...data.map(d => Math.max(d.views, d.visitors)));
                        const width = 600;
                        const height = 150;
                        const paddingX = 30;
                        const paddingY = 20;
                        const graphW = width - paddingX * 2;
                        const graphH = height - paddingY * 2;

                        const getX = (i) => paddingX + (i / Math.max(1, data.length - 1)) * graphW;
                        const getY = (val) => height - paddingY - (val / maxVal) * graphH;

                        const viewPoints = data.map((d, i) => `${getX(i)},${getY(d.views)}`).join(' ');
                        const visitorPoints = data.map((d, i) => `${getX(i)},${getY(d.visitors)}`).join(' ');

                        const areaPath = `M ${getX(0)},${height - paddingY} ` +
                          data.map((d, i) => `L ${getX(i)},${getY(d.views)}`).join(' ') +
                          ` L ${getX(data.length - 1)},${height - paddingY} Z`;

                        return (
                          <div className="svg-wrapper">
                            <svg viewBox={`0 0 ${width} ${height}`} className="interactive-svg-chart" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                              <line x1={paddingX} y1={paddingY + graphH / 2} x2={width - paddingX} y2={paddingY + graphH / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" />

                              <path d={areaPath} fill="url(#viewsAreaGrad)" />
                              <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={viewPoints} />
                              <polyline fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" points={visitorPoints} />

                              {data.map((d, i) => (
                                <g key={d.date} className="chart-dot-group">
                                  <circle 
                                    cx={getX(i)} 
                                    cy={getY(d.views)} 
                                    r="4" 
                                    className="chart-dot views"
                                    onMouseEnter={() => setHoveredChartPoint(d)}
                                    onMouseLeave={() => setHoveredChartPoint(null)}
                                  />
                                </g>
                              ))}
                            </svg>

                            {hoveredChartPoint && (
                              <div className="chart-hover-tooltip">
                                <span className="tooltip-date">{hoveredChartPoint.date}</span>
                                <div className="tooltip-metrics">
                                  <span className="tooltip-view-val">👁 {hoveredChartPoint.views} vue(s)</span>
                                  <span className="tooltip-vis-val">👤 {hoveredChartPoint.visitors} visiteur(s)</span>
                                </div>
                              </div>
                            )}

                            <div className="chart-x-labels">
                              {data.map((d, i) => (
                                (data.length <= 8 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) ? (
                                  <span key={d.date} className="chart-label-day">{d.label}</span>
                                ) : null
                              ))}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="chart-empty-state">
                          <span>Données en cours de synchronisation...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grille 2 Colonnes : Top Pays & Répartition Appareils */}
                  <div className="analytics-dual-row">
                    
                    {/* Colonne 1 : Top Pays */}
                    <div className="analytics-panel-card">
                      <div className="panel-card-head">
                        <div className="head-title-col">
                          <h3>Top Pays des Visiteurs</h3>
                          <p>Origine géographique réelle des personnes intéressées</p>
                        </div>
                        <Globe size={15} className="panel-icon-subtle" />
                      </div>

                      <div className="countries-list-cluster">
                        {analyticsData.topCountries && analyticsData.topCountries.length > 0 ? (
                          analyticsData.topCountries.map((c) => (
                            <div key={c.code} className="country-rank-row">
                              <div className="country-name-cell">
                                <span className="flag-icon">{getCountryFlag(c.code)}</span>
                                <span className="country-title">{c.country}</span>
                              </div>
                              <div className="country-gauge-wrapper">
                                <div className="country-gauge-track">
                                  <div 
                                    className="country-gauge-fill" 
                                    style={{ width: `${Math.min(100, Math.max(6, c.pct))}%` }}
                                  />
                                </div>
                              </div>
                              <div className="country-stat-badge">
                                <span className="count-num">{c.count}</span>
                                <span className="pct-num">({c.pct}%)</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="panel-empty-row">
                            <span>Aucune donnée géographique enregistrée sur cette période.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne 2 : Appareils & Systèmes */}
                    <div className="analytics-panel-card">
                      <div className="panel-card-head">
                        <div className="head-title-col">
                          <h3>Appareils & Systèmes</h3>
                          <p>Mobiles Android, iPhone et ordinateurs utilisés</p>
                        </div>
                        <Smartphone size={15} className="panel-icon-subtle" />
                      </div>

                      <div className="devices-list-cluster">
                        {analyticsData.devices && analyticsData.devices.length > 0 ? (
                          analyticsData.devices.map((dev, idx) => (
                            <div key={dev.os + idx} className="device-stat-row">
                              <div className="device-info-left">
                                <div className="device-icon-box">
                                  {dev.type === 'Mobile' ? <Smartphone size={14} className="text-sky" /> : <Laptop size={14} className="text-emerald" />}
                                </div>
                                <div className="device-text-col">
                                  <span className="device-os-name">{dev.os}</span>
                                  <span className="device-type-label">{dev.type}</span>
                                </div>
                              </div>
                              <div className="device-gauge-track">
                                <div 
                                  className="device-gauge-fill" 
                                  style={{ width: `${Math.min(100, Math.max(6, dev.pct))}%` }}
                                />
                              </div>
                              <div className="device-num-col">
                                <span className="dev-count">{dev.count}</span>
                                <span className="dev-pct">{dev.pct}%</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="panel-empty-row">
                            <span>Données d'appareils en cours d'acquisition.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Grille : Détail de Chaque Page Vue & Activité Récente */}
                  <div className="analytics-dual-row">
                    
                    {/* Détail précis de chaque page vue */}
                    <div className="analytics-panel-card">
                      <div className="panel-card-head">
                        <div className="head-title-col">
                          <h3>Détail de chaque Page Vue</h3>
                          <p>Fréquentation réelle et visiteurs uniques par page</p>
                        </div>
                        <FileText size={15} className="panel-icon-subtle" />
                      </div>

                      <div className="pages-detail-list">
                        {analyticsData.pagesDetail && analyticsData.pagesDetail.length > 0 ? (
                          analyticsData.pagesDetail.map((pageItem, idx) => (
                            <div key={pageItem.path + idx} className="page-stat-row">
                              <div className="page-info-col">
                                <div className="page-title-row">
                                  <span className="page-name-title">{pageItem.name}</span>
                                  <span className="page-path-chip">{pageItem.path}</span>
                                </div>
                                <div className="page-gauge-track">
                                  <div 
                                    className="page-gauge-fill" 
                                    style={{ width: `${Math.min(100, Math.max(5, pageItem.pct))}%` }}
                                  />
                                </div>
                              </div>
                              <div className="page-metrics-badges">
                                <span className="page-views-badge" title="Pages vues">
                                  <Eye size={11} />
                                  <strong>{pageItem.views}</strong> vue(s)
                                </span>
                                <span className="page-visitors-badge" title="Visiteurs uniques">
                                  <Users size={11} />
                                  <strong>{pageItem.visitors}</strong> unique(s)
                                </span>
                                <span className="page-pct-badge">{pageItem.pct}%</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="panel-empty-row">
                            <span>Aucune consultation de page enregistrée pour cette période.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Flux d'activité en direct */}
                    <div className="analytics-panel-card">
                      <div className="panel-card-head">
                        <div className="head-title-col">
                          <h3>Activité Récente en Direct</h3>
                          <p>Les 10 dernières visites enregistrées sur le site</p>
                        </div>
                        <Radio size={14} className="panel-icon-subtle text-green" />
                      </div>

                      <div className="live-feed-list">
                        {analyticsData.recentVisits && analyticsData.recentVisits.length > 0 ? (
                          analyticsData.recentVisits.map((item, i) => (
                            <div key={i} className="feed-item-row">
                              <span className="feed-flag">{getCountryFlag(item.code)}</span>
                              <div className="feed-details">
                                <div className="feed-line-top">
                                  <span className="feed-country">{item.country}</span>
                                  <span className="feed-device">{item.device}</span>
                                </div>
                                <span className="feed-event">
                                  {item.event === 'page_view' ? 'Consultation de la page' : 
                                   item.event.includes('unlock') ? '🎯 Clic Débloquer formation' :
                                   item.event.includes('demo') ? '📖 Lecture d\'un extrait' :
                                   item.event.includes('fedapay') || item.event.includes('pay') ? '💳 Paiement FedaPay' :
                                   item.event.includes('whatsapp') ? '💬 Clic WhatsApp' : 
                                   item.event.includes('switch') ? '🔄 Bascule de formation' : item.event}
                                </span>
                              </div>
                              <span className="feed-time">
                                {item.time ? item.time.split(' ')[1] || item.time : 'Récemment'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="panel-empty-row">
                            <span>En attente de nouvelles visites...</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Grand Panneau : Clics Détaillés sur Chaque Bouton de Formation */}
                  <div className="analytics-panel-card">
                    <div className="panel-card-head">
                      <div className="head-title-col">
                        <h3>Détail des Clics sur Chaque Bouton de Formation</h3>
                        <p>Nombre de clics précis sur chaque bouton d'action, d'achat et d'extrait</p>
                      </div>
                      <MousePointerClick size={15} className="panel-icon-subtle text-amber" />
                    </div>

                    <div className="formation-buttons-grid">
                      {analyticsData.formationButtonsDetail && analyticsData.formationButtonsDetail.length > 0 ? (
                        analyticsData.formationButtonsDetail.map((formationGroup) => (
                          <div key={formationGroup.formationId} className={`formation-button-card ${formationGroup.color}`}>
                            <div className="f-btn-card-head">
                              <div className="f-btn-head-title">
                                <span className="f-btn-dot"></span>
                                <h4>{formationGroup.formationTitle}</h4>
                              </div>
                              <span className="f-btn-total-pill">
                                {formationGroup.totalClicks} clic(s) au total
                              </span>
                            </div>

                            <div className="f-buttons-rows-list">
                              {formationGroup.buttons.map((btn) => (
                                <div key={btn.id} className="f-single-button-row">
                                  <div className="f-single-btn-left">
                                    <div className="f-btn-icon-bubble">
                                      {btn.id === 'unlock' && <Lock size={12} />}
                                      {btn.id === 'demo' && <BookOpen size={12} />}
                                      {btn.id === 'fedapay' && <CreditCard size={12} />}
                                      {btn.id === 'whatsapp' && <MessageCircle size={12} />}
                                      {btn.id === 'switch' && <ArrowRight size={12} />}
                                      {btn.id === 'cta_home' && <Sparkles size={12} />}
                                      {btn.id === 'vip_code' && <Tag size={12} />}
                                      {btn.id === 'services' && <Briefcase size={12} />}
                                    </div>
                                    <div className="f-btn-name-col">
                                      <span className="f-btn-name">{btn.name}</span>
                                      <span className="f-btn-tag-desc">{btn.tag}</span>
                                    </div>
                                  </div>

                                  <div className="f-single-btn-right">
                                    <div className="f-btn-gauge-track">
                                      <div 
                                        className="f-btn-gauge-fill"
                                        style={{ 
                                          width: `${formationGroup.totalClicks > 0 ? Math.min(100, Math.max(8, Math.round((btn.count / formationGroup.totalClicks) * 100))) : 0}%` 
                                        }}
                                      />
                                    </div>
                                    <span className={`f-btn-click-count ${btn.count > 0 ? 'highlight' : ''}`}>
                                      <strong>{btn.count}</strong> clic(s)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="panel-empty-row">
                          <span>Aucun clic enregistré sur les boutons pour cette période.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ============================================================
                  ONGLET 2 : ÉLÈVES & INSCRIPTIONS (TABLEAU HAUTE DENSITÉ)
                 ============================================================ */}
              {activeTab === 'students' && (
                <div className="content-tab-flow">
                  
                  {/* Barre d'outils */}
                  <div className="table-toolbar-strip">
                    <div className="toolbar-search-box">
                      <Search size={14} className="search-glyph" />
                      <input 
                        type="text" 
                        placeholder="Rechercher par nom, email ou code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button className="btn-glyph-clear" onClick={() => setSearchTerm('')}>✕</button>
                      )}
                    </div>

                    <div className="toolbar-right-controls">
                      <select 
                        value={bookFilter} 
                        onChange={(e) => setBookFilter(e.target.value)}
                        className="select-filter-compact"
                      >
                        <option value="all">Toutes les formations</option>
                        <option value="livre-bd-storytelling">Livre 1 : BD & Storytelling</option>
                        <option value="livre-videos-ia">Livre 2 : Vidéos Virales IA</option>
                      </select>

                      <button 
                        className="btn-icon-labeled"
                        onClick={handleExportCSV}
                        title="Télécharger l'historique complet en CSV"
                      >
                        <Download size={13} />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Tableau des élèves */}
                  <div className="saas-table-card">
                    <table className="saas-data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Élève</th>
                          <th>Email Google</th>
                          <th>Formation</th>
                          <th>Montant Payé</th>
                          <th>Code Utilisé</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id}>
                            <td className="col-date">{ord.date}</td>
                            <td>
                              <div className="student-profile-item">
                                <span className="profile-dot">{(ord.clientName || 'E').charAt(0).toUpperCase()}</span>
                                <strong className="profile-name">{ord.clientName}</strong>
                              </div>
                            </td>
                            <td className="col-email-code">{ord.clientEmail}</td>
                            <td>
                              <span className={`pill-mini-formation ${ord.itemId === 'livre-bd-storytelling' ? 'bd' : 'video'}`}>
                                {ord.itemId === 'livre-bd-storytelling' ? '📕 BD Storytelling' : '🎬 Vidéos IA'}
                              </span>
                            </td>
                            <td>
                              <strong className="amount-clean">
                                {ord.amount ? `${ord.amount.toLocaleString()} FCFA` : 'Offert (Code Gratuit)'}
                              </strong>
                            </td>
                            <td>
                              <button 
                                className="code-badge-copy"
                                onClick={() => handleCopy(ord.code)}
                                title="Cliquer pour copier"
                              >
                                <code>{ord.code}</code>
                                {copiedCode === ord.code ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                              </button>
                            </td>
                            <td>
                              <span className="badge-status-green">
                                <CheckCircle2 size={11} />
                                <span>Actif</span>
                              </span>
                            </td>
                          </tr>
                        ))}

                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan="7" className="empty-table-state">
                              Aucun élève trouvé pour cette recherche.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ============================================================
                  ONGLET : TARIFS & PRIX DES FORMATIONS
                 ============================================================ */}
              {activeTab === 'pricing' && (
                <div className="content-tab-flow">
                  
                  {/* En-tête de section avec bouton de remise par défaut */}
                  <div className="section-banner-card gold-accent">
                    <div className="banner-left-info">
                      <div className="banner-badge-title">
                        <DollarSign size={16} className="text-gold" />
                        <h3>Tarifs & Prix de Vente des Formations</h3>
                      </div>
                      <p>
                        Modifiez ici les prix de vente en direct. Toute modification est
                        <strong> immédiatement synchronisée sans aucune erreur</strong> sur tout le site 
                        (Vitrine, Page d'accueil, Lecteur et FedaPay).
                      </p>
                    </div>

                    <button 
                      type="button"
                      className="btn-action-secondary"
                      onClick={handleResetPrices}
                      title="Rétablir les tarifs officiels par défaut"
                    >
                      <RefreshCw size={13} />
                      <span>Prix par défaut</span>
                    </button>
                  </div>

                  {/* Message de confirmation de sauvegarde */}
                  {priceSuccessMsg && (
                    <div className="price-save-alert-banner">
                      <CheckCircle2 size={16} className="text-green" />
                      <span>{priceSuccessMsg}</span>
                    </div>
                  )}

                  {/* Grille des 3 Cartes de Prix */}
                  <form onSubmit={handleSavePrices} className="pricing-manager-form">
                    <div className="pricing-grid-cards">
                      
                      {/* CARTE 1 : Livre 1 BD */}
                      <div className="pricing-card-box">
                        <div className="pricing-card-header">
                          <div className="pricing-card-badge-row">
                            <span className="pricing-type-pill pill-bd">Livre 1</span>
                            <span className="pricing-status-pill">En ligne</span>
                          </div>
                          <div className="pricing-card-icon-title">
                            <div className="pricing-icon-bubble gold">
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <h4>L'Art du Storytelling & BD</h4>
                              <span className="pricing-subtitle">Guide BD avec Intelligence Artificielle</span>
                            </div>
                          </div>
                        </div>

                        <div className="pricing-card-body">
                          <div className="pricing-current-display-grid">
                            <div>
                              <span className="pricing-display-label">Prix de vente en ligne :</span>
                              <span className="pricing-display-val gold">
                                {(formationPrices['livre-bd-storytelling'] || 2500).toLocaleString()} FCFA
                              </span>
                            </div>
                            <div>
                              <span className="pricing-display-label">Prix d'origine barré :</span>
                              <span className="pricing-display-val">
                                <del>{(formationOriginalPrices['livre-bd-storytelling'] || 5000).toLocaleString()} FCFA</del>
                              </span>
                            </div>
                          </div>

                          {/* Champ 1 : Prix de vente actuel */}
                          <div className="pricing-input-field-group">
                            <label htmlFor="price-bd">1. Prix de vente actuel (ce que paie le client) :</label>
                            <div className="pricing-input-currency-box">
                              <input 
                                id="price-bd"
                                type="number" 
                                min="0" 
                                step="100" 
                                value={priceInputs['livre-bd-storytelling'] ?? 2500}
                                onChange={(e) => handlePriceInputChange('livre-bd-storytelling', e.target.value)}
                                placeholder="2500"
                                required
                              />
                              <span className="currency-suffix">FCFA</span>
                            </div>
                          </div>

                          <div className="pricing-quick-chips">
                            <span className="quick-label">Suggestions :</span>
                            {[2000, 2500, 3000, 5000].map(amt => (
                              <button 
                                key={amt}
                                type="button"
                                className={`pricing-chip-btn ${Number(priceInputs['livre-bd-storytelling']) === amt ? 'selected' : ''}`}
                                onClick={() => handlePriceInputChange('livre-bd-storytelling', amt)}
                              >
                                {amt.toLocaleString()} F
                              </button>
                            ))}
                          </div>

                          {/* Champ 2 : Prix barré d'origine */}
                          <div className="pricing-input-field-group">
                            <label htmlFor="orig-price-bd">2. Prix barré (grand prix d'origine barré) :</label>
                            <div className="pricing-input-currency-box">
                              <input 
                                id="orig-price-bd"
                                type="number" 
                                min="0" 
                                step="100" 
                                value={originalPriceInputs['livre-bd-storytelling'] ?? 5000}
                                onChange={(e) => handleOriginalPriceInputChange('livre-bd-storytelling', e.target.value)}
                                placeholder="5000"
                                required
                              />
                              <span className="currency-suffix">FCFA</span>
                            </div>
                          </div>

                          <div className="pricing-quick-chips">
                            <span className="quick-label">Suggestions barré :</span>
                            {[4000, 5000, 6000, 8000, 10000].map(amt => (
                              <button 
                                key={amt}
                                type="button"
                                className={`pricing-chip-btn ${Number(originalPriceInputs['livre-bd-storytelling']) === amt ? 'selected' : ''}`}
                                onClick={() => handleOriginalPriceInputChange('livre-bd-storytelling', amt)}
                              >
                                {amt.toLocaleString()} F
                              </button>
                            ))}
                          </div>

                          {/* Aperçu visiteur */}
                          <div className="pricing-preview-box">
                            <span className="preview-label">Aperçu visiteur :</span>
                            <div className="preview-rendered-badge">
                              <span className="preview-struck">{(Number(originalPriceInputs['livre-bd-storytelling']) || 5000).toLocaleString()} FCFA</span>
                              <span className="preview-current">{(Number(priceInputs['livre-bd-storytelling']) || 2500).toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARTE 2 : Livre 2 Vidéos IA */}
                      <div className="pricing-card-box">
                        <div className="pricing-card-header">
                          <div className="pricing-card-badge-row">
                            <span className="pricing-type-pill pill-video">Livre 2</span>
                            <span className="pricing-status-pill cyan">Tendance 2026</span>
                          </div>
                          <div className="pricing-card-icon-title">
                            <div className="pricing-icon-bubble cyan">
                              <Video size={18} />
                            </div>
                            <div>
                              <h4>Création de Vidéos Virales</h4>
                              <span className="pricing-subtitle">Guide Vidéos & Animation avec IA</span>
                            </div>
                          </div>
                        </div>

                        <div className="pricing-card-body">
                          <div className="pricing-current-display-grid">
                            <div>
                              <span className="pricing-display-label">Prix de vente en ligne :</span>
                              <span className="pricing-display-val gold">
                                {(formationPrices['livre-videos-ia'] || 3100).toLocaleString()} FCFA
                              </span>
                            </div>
                            <div>
                              <span className="pricing-display-label">Prix d'origine barré :</span>
                              <span className="pricing-display-val">
                                <del>{(formationOriginalPrices['livre-videos-ia'] || 6000).toLocaleString()} FCFA</del>
                              </span>
                            </div>
                          </div>

                          {/* Champ 1 : Prix de vente actuel */}
                          <div className="pricing-input-field-group">
                            <label htmlFor="price-video">1. Prix de vente actuel (ce que paie le client) :</label>
                            <div className="pricing-input-currency-box">
                              <input 
                                id="price-video"
                                type="number" 
                                min="0" 
                                step="100" 
                                value={priceInputs['livre-videos-ia'] ?? 3100}
                                onChange={(e) => handlePriceInputChange('livre-videos-ia', e.target.value)}
                                placeholder="3100"
                                required
                              />
                              <span className="currency-suffix">FCFA</span>
                            </div>
                          </div>

                          <div className="pricing-quick-chips">
                            <span className="quick-label">Suggestions :</span>
                            {[2500, 3100, 4000, 6000].map(amt => (
                              <button 
                                key={amt}
                                type="button"
                                className={`pricing-chip-btn ${Number(priceInputs['livre-videos-ia']) === amt ? 'selected' : ''}`}
                                onClick={() => handlePriceInputChange('livre-videos-ia', amt)}
                              >
                                {amt.toLocaleString()} F
                              </button>
                            ))}
                          </div>

                          {/* Champ 2 : Prix barré d'origine */}
                          <div className="pricing-input-field-group">
                            <label htmlFor="orig-price-video">2. Prix barré (grand prix d'origine barré) :</label>
                            <div className="pricing-input-currency-box">
                              <input 
                                id="orig-price-video"
                                type="number" 
                                min="0" 
                                step="100" 
                                value={originalPriceInputs['livre-videos-ia'] ?? 6000}
                                onChange={(e) => handleOriginalPriceInputChange('livre-videos-ia', e.target.value)}
                                placeholder="6000"
                                required
                              />
                              <span className="currency-suffix">FCFA</span>
                            </div>
                          </div>

                          <div className="pricing-quick-chips">
                            <span className="quick-label">Suggestions barré :</span>
                            {[5000, 6000, 8000, 12000].map(amt => (
                              <button 
                                key={amt}
                                type="button"
                                className={`pricing-chip-btn ${Number(originalPriceInputs['livre-videos-ia']) === amt ? 'selected' : ''}`}
                                onClick={() => handleOriginalPriceInputChange('livre-videos-ia', amt)}
                              >
                                {amt.toLocaleString()} F
                              </button>
                            ))}
                          </div>

                          {/* Aperçu visiteur */}
                          <div className="pricing-preview-box">
                            <span className="preview-label">Aperçu visiteur :</span>
                            <div className="preview-rendered-badge">
                              <span className="preview-struck">{(Number(originalPriceInputs['livre-videos-ia']) || 6000).toLocaleString()} FCFA</span>
                              <span className="preview-current">{(Number(priceInputs['livre-videos-ia']) || 3100).toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barre de Validation & Réassurance */}
                    <div className="pricing-submit-bar-card">
                      <div className="pricing-summary-info">
                        <p className="pricing-instant-reassurance">
                          ⚡ Les prix barrés et les tarifs de vente s'affichent immédiatement partout sur le site et FedaPay.
                        </p>
                        <p className="pricing-subnote">
                          Note : Aucune mention de promotion n'est affichée — seul le prix barré élégant est visible par vos clients.
                        </p>
                      </div>

                      <div className="pricing-buttons-row">
                        <button 
                          type="button" 
                          className="btn-reset-prices"
                          onClick={handleResetPrices}
                          title="Rétablir les prix d'origine"
                        >
                          <RotateCcw size={14} />
                          <span>Rétablir par défaut</span>
                        </button>
                        <button 
                          type="submit" 
                          className="btn-action-primary gold btn-save-prices"
                        >
                          <Check size={16} />
                          <span>Enregistrer & Appliquer les Tarifs</span>
                        </button>
                      </div>
                    </div>
                  </form>

                </div>
              )}

              {/* ============================================================
                  ONGLET 3 : CODES D'ACCÈS GRATUITS (USAGE UNIQUE SANS PAIEMENT)
                 ============================================================ */}
              {activeTab === 'free_codes' && (
                <div className="content-tab-flow">
                  
                  {/* En-tête de section avec bouton ouvrant la modale */}
                  <div className="section-banner-card">
                    <div className="banner-left-info">
                      <div className="banner-badge-title">
                        <Gift size={16} className="text-gold" />
                        <h3>Codes d'Accès Gratuits (Usage Unique • 100% Offerts)</h3>
                      </div>
                      <p>
                        Ces codes débloquent directement la formation <strong>sans aucun paiement</strong>. 
                        Idéal pour vos cadeaux, concours ou partenaires de confiance.
                      </p>
                    </div>

                    {/* Bouton qui ouvre la modale */}
                    <button 
                      className="btn-action-primary gold"
                      onClick={() => {
                        setModalSuccessCode(null);
                        setIsFreeCodeModalOpen(true);
                      }}
                    >
                      <Plus size={15} />
                      <span>Nouveau Code Gratuit</span>
                    </button>
                  </div>

                  {/* Filtres Disponibles / Utilisés / Bloqués */}
                  <div className="chips-filter-row">
                    <button 
                      className={`chip-filter-btn ${codeStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setCodeStatusFilter('all')}
                    >
                      Tous ({adminCodes.length})
                    </button>
                    <button 
                      className={`chip-filter-btn ${codeStatusFilter === 'available' ? 'active' : ''}`}
                      onClick={() => setCodeStatusFilter('available')}
                    >
                      🟢 Disponibles ({availableCount})
                    </button>
                    <button 
                      className={`chip-filter-btn ${codeStatusFilter === 'used' ? 'active' : ''}`}
                      onClick={() => setCodeStatusFilter('used')}
                    >
                      🔴 Utilisés ({usedCount})
                    </button>
                    <button 
                      className={`chip-filter-btn ${codeStatusFilter === 'blocked' ? 'active' : ''}`}
                      onClick={() => setCodeStatusFilter('blocked')}
                    >
                      ⛔ Bloqués ({blockedCount})
                    </button>
                  </div>

                  {/* Tableau des codes gratuits */}
                  <div className="saas-table-card">
                    <table className="saas-data-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Formation Débloquée</th>
                          <th>Bénéficiaire / Note</th>
                          <th>Statut</th>
                          <th>Créé le</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCodes.map((c) => {
                          const isUsed = c.status === 'UTILISÉ';
                          return (
                            <tr key={c.id} className={isUsed ? 'row-faded' : ''}>
                              <td>
                                <button 
                                  className="code-badge-copy"
                                  onClick={() => handleCopy(c.code)}
                                  title="Copier le code"
                                >
                                  <code>{c.code}</code>
                                  {copiedCode === c.code ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                                </button>
                              </td>
                              <td>
                                <span className="label-formation-clean">{c.itemTitle}</span>
                              </td>
                              <td className="recipient-text">{c.recipientName || 'Bénéficiaire'}</td>
                              <td>
                                {c.status === 'BLOQUÉ' ? (
                                  <span className="pill-status-blocked" title={`Bloqué le ${c.blockedAt || ''}`}>
                                    ⛔ Bloqué {c.usedBy ? `(${c.usedBy})` : ''}
                                  </span>
                                ) : isUsed ? (
                                  <span className="pill-status-used">
                                    🔴 Utilisé par <strong>{c.usedBy}</strong>
                                  </span>
                                ) : (
                                  <span className="pill-status-avail">
                                    🟢 Prêt à l'emploi
                                  </span>
                                )}
                              </td>
                              <td className="col-date">{c.createdAt}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-icon-actions">
                                  {c.status === 'BLOQUÉ' ? (
                                    <>
                                      <button 
                                        className="btn-icon-tool unblock"
                                        onClick={() => handleUnblockCode(c.id)}
                                        title="Débloquer / Réactiver ce code (rétablir l'accès)"
                                      >
                                        <CheckCircle2 size={13} className="text-green" />
                                      </button>

                                      <button 
                                        className="btn-icon-tool delete"
                                        onClick={() => handleDeleteCode(c.id, c.status)}
                                        title="Supprimer définitivement ce code bloqué"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  ) : c.status === 'UTILISÉ' ? (
                                    /* Si activé par un élève, on doit d'abord le bloquer pour révoquer l'accès */
                                    <button 
                                      className="btn-icon-tool block"
                                      onClick={() => handleBlockCode(c.id)}
                                      title="Bloquer ce code d'accès (révoque la formation et déconnecte l'élève)"
                                    >
                                      <Ban size={13} className="text-red" />
                                    </button>
                                  ) : (
                                    /* Si non utilisé (DISPONIBLE), suppression directe possible sans bloquer */
                                    <button 
                                      className="btn-icon-tool delete"
                                      onClick={() => handleDeleteCode(c.id, c.status)}
                                      title="Supprimer ce code non utilisé"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}

                                  <button 
                                    className="btn-icon-tool whatsapp"
                                    onClick={() => handleCopyWhatsAppMessage(c)}
                                    title="Copier le message complet WhatsApp avec le lien pour l'élève"
                                  >
                                    <Share2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredCodes.length === 0 && (
                          <tr>
                            <td colSpan="6" className="empty-table-state">
                              Aucun code gratuit dans cette sélection.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ============================================================
                  ONGLET 4 : PROMOTEURS & CODES PROMO (RÉDUCTION + COMMISSION)
                 ============================================================ */}
              {activeTab === 'promo_codes' && (
                <div className="content-tab-flow">
                  
                  {/* En-tête avec bouton ouvrant la modale */}
                  <div className="section-banner-card purple-accent">
                    <div className="banner-left-info">
                      <div className="banner-badge-title">
                        <Percent size={16} className="text-purple" />
                        <h3>Promoteurs & Codes Promo (Réduction + Commission)</h3>
                      </div>
                      <p>
                        <strong>Fonctionnement :</strong> L'élève applique le code promo pour <strong>réduire le prix à payer</strong> (ex: de 5 000 à 4 000 FCFA), 
                        le <strong>promoteur touche sa part de commission</strong>, et il dispose de son <strong>propre lien d'espace privé</strong> pour suivre ses gains.
                      </p>
                    </div>

                    <button 
                      className="btn-action-primary purple"
                      onClick={() => {
                        setPromoCreatedSuccess(null);
                        setPromoterError('');
                        setIsPromoModalOpen(true);
                      }}
                    >
                      <Plus size={15} />
                      <span>Nouveau Promoteur</span>
                    </button>
                  </div>

                  {/* 4 Mini KPIs Affiliation */}
                  <div className="kpi-micro-row">
                    <div className="kpi-micro-box purple">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Promoteurs Actifs</span>
                        <div className="micro-box-icon purple"><Users size={13} /></div>
                      </div>
                      <div className="micro-box-number">{promoters.filter(p => p.status === 'ACTIF').length} promoteur(s)</div>
                      <span className="micro-box-caption">Partenaires avec code promo</span>
                    </div>

                    <div className="kpi-micro-box cyan">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Ventes avec Réduction</span>
                        <div className="micro-box-icon cyan"><Tag size={13} /></div>
                      </div>
                      <div className="micro-box-number">{promoters.reduce((acc, p) => acc + (p.salesCount || 0), 0)} commande(s)</div>
                      <span className="micro-box-caption">Codes promo appliqués</span>
                    </div>

                    <div className="kpi-micro-box gold">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Commissions Dues</span>
                        <div className="micro-box-icon gold"><DollarSign size={13} /></div>
                      </div>
                      <div className="micro-box-number">{promoters.reduce((acc, p) => acc + (p.totalEarned || 0), 0).toLocaleString()} FCFA</div>
                      <span className="micro-box-caption">Gains cumulés des partenaires</span>
                    </div>

                    <div className="kpi-micro-box green">
                      <div className="micro-box-top">
                        <span className="micro-box-label">Total Partenaires</span>
                        <div className="micro-box-icon green"><TrendingUp size={13} /></div>
                      </div>
                      <div className="micro-box-number">{promoters.length} compte(s)</div>
                      <span className="micro-box-caption">Comptes promoteurs créés</span>
                    </div>
                  </div>

                  {/* Tableau des promoteurs */}
                  <div className="saas-table-card">
                    <table className="saas-data-table">
                      <thead>
                        <tr>
                          <th>Promoteur</th>
                          <th>Code Promo</th>
                          <th>Formation</th>
                          <th>Réduction Élève</th>
                          <th>Commission</th>
                          <th>Ventes</th>
                          <th>Gains</th>
                          <th>Statut</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promoters.map((p) => {
                          const isBlocked = p.status === 'BLOQUÉ';
                          const phoneDisplay = formatPhoneNumber(p.whatsapp || p.payoutPhone);
                          return (
                            <tr key={p.id} className={isBlocked ? 'row-faded' : ''}>
                              <td>
                                <div className="promoter-profile-cell">
                                  <div className="promoter-avatar-badge">
                                    {(p.prenom || p.nom || 'P').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="promoter-identity-details">
                                    <strong className="promoter-name-text">{p.prenom} {p.nom}</strong>
                                    <div className="promoter-sub-contacts">
                                      {phoneDisplay && (
                                        <span className="promoter-contact-pill phone" title="WhatsApp / Téléphone">
                                          <Phone size={10} className="contact-icon phone" />
                                          <span>{phoneDisplay}</span>
                                        </span>
                                      )}
                                      {p.email && (
                                        <span className="promoter-contact-pill email" title="Gmail">
                                          <Mail size={10} className="contact-icon email" />
                                          <span>{p.email}</span>
                                        </span>
                                      )}
                                      {!phoneDisplay && !p.email && (
                                        <span className="promoter-contact-pending">Contacts en attente</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <button 
                                  className="code-badge-copy"
                                  onClick={() => handleCopy(p.codePromo)}
                                  title="Copier le code promo"
                                >
                                  <code>{p.codePromo}</code>
                                  {copiedCode === p.codePromo ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                                </button>
                              </td>
                              <td>
                                <span className="label-formation-clean gold">
                                  🌟 Les 2 Formations
                                </span>
                              </td>
                              <td>
                                <span className="pill-status-avail">-{p.reductionPct}%</span>
                              </td>
                              <td>
                                <span className="pill-status-avail purple">{p.commissionPct}%</span>
                              </td>
                              <td>
                                <strong>{p.salesCount || 0}</strong>
                              </td>
                              <td>
                                <span className="col-gain gold">{(p.totalEarned || 0).toLocaleString()} FCFA</span>
                              </td>
                              <td>
                                {isBlocked ? (
                                  <span className="pill-status-blocked">⛔ Bloqué</span>
                                ) : !p.password ? (
                                  <span className="pill-status-pending" title="En attente de 1ère connexion par le promoteur">⏳ En attente</span>
                                ) : (
                                  <span className="pill-status-avail">🟢 Actif</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-icon-actions">
                                  <button 
                                    className="btn-icon-tool copy-link"
                                    onClick={() => handleCopyPromoterPortalLink(p)}
                                    title="Copier le lien direct de son Espace Promoteur"
                                  >
                                    {copiedLinkPromoter === p.id ? <Check size={13} className="text-green" /> : <Link2 size={13} />}
                                  </button>

                                  <button 
                                    className="btn-icon-tool open-portal"
                                    onClick={() => window.open(`${window.location.origin}/#promoteur?code=${p.codePromo}`, '_blank')}
                                    title="Ouvrir l'Espace Promoteur de ce partenaire dans un nouvel onglet"
                                  >
                                    <ExternalLink size={13} />
                                  </button>

                                  <button 
                                    className="btn-icon-tool whatsapp"
                                    onClick={() => handleCopyPromoterInvitation(p)}
                                    title="Copier le message complet WhatsApp avec le lien pour le promoteur"
                                  >
                                    <Share2 size={13} />
                                  </button>

                                  <button 
                                    className="btn-icon-tool key"
                                    onClick={() => handleAdminResetPassword(p)}
                                    title="Réinitialiser ou modifier le mot de passe de ce promoteur"
                                  >
                                    <KeyRound size={13} />
                                  </button>

                                  <button 
                                    className={`btn-icon-tool ${isBlocked ? 'unblock' : 'block'}`}
                                    onClick={() => handleTogglePromoterStatus(p.id)}
                                    title={isBlocked ? "Débloquer ce promoteur" : "Bloquer ce promoteur (désactive son code)"}
                                  >
                                    {isBlocked ? <CheckCircle2 size={13} className="text-green" /> : <Ban size={13} className="text-red" />}
                                  </button>

                                  <button 
                                    className="btn-icon-tool delete"
                                    onClick={() => handleDeletePromoter(p.id, p.codePromo)}
                                    title="Supprimer définitivement ce promoteur"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {promoters.length === 0 && (
                          <tr>
                            <td colSpan="9" className="empty-table-state">
                              <Tag size={18} className="muted-icon" />
                              <span>Aucun promoteur configuré pour l'instant. Cliquez sur <strong>« Nouveau Promoteur »</strong> pour créer votre premier partenaire.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </div>

            {/* BARRE DE NAVIGATION BASSE SPÉCIALE SMARTPHONES */}
            <nav className="admin-mobile-bottom-nav">
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={17} />
                <span>Ventes</span>
              </button>
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <Activity size={17} className="text-sky" />
                <span>Visites</span>
              </button>
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                <Users size={17} />
                <span>Élèves</span>
                {stats.totalStudents > 0 && <span className="mobile-badge">{stats.totalStudents}</span>}
              </button>
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                <DollarSign size={17} className="text-gold" />
                <span>Tarifs</span>
              </button>
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'free_codes' ? 'active' : ''}`}
                onClick={() => setActiveTab('free_codes')}
              >
                <Gift size={17} />
                <span>VIP</span>
                {adminCodes.length > 0 && <span className="mobile-badge">{adminCodes.length}</span>}
              </button>
              <button 
                type="button"
                className={`mobile-nav-tab ${activeTab === 'promo_codes' ? 'active' : ''}`}
                onClick={() => setActiveTab('promo_codes')}
              >
                <Percent size={17} />
                <span>Promo</span>
                {promoters.length > 0 && <span className="mobile-badge">{promoters.length}</span>}
              </button>
            </nav>

          </main>

        </div>
      )}

      {/* ====================================================================
          MODALE 1 : CRÉATION DE CODE GRATUIT (VIP SANS PAIEMENT)
         ==================================================================== */}
      {isFreeCodeModalOpen && (
        <div className="modal-overlay-backdrop">
          <div className="modal-dialog-box">
            
            <div className="dialog-header">
              <div className="dialog-title-flex">
                <Gift size={18} className="text-gold" />
                <div>
                  <h4>Générer un Code d'Accès Gratuit</h4>
                  <p>Débloque directement la formation choisie sans paiement.</p>
                </div>
              </div>
              <button 
                className="btn-dialog-close" 
                onClick={() => setIsFreeCodeModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            {!modalSuccessCode ? (
              <form onSubmit={handleCreateFreeCode} className="dialog-form-flow">
                <div className="dialog-field">
                  <label>Formation à débloquer :</label>
                  <select 
                    value={selectedBookForCode}
                    onChange={(e) => setSelectedBookForCode(e.target.value)}
                    className="dialog-input"
                  >
                    <option value="livre-bd-storytelling">📕 Livre 1 : BD & Storytelling</option>
                    <option value="livre-videos-ia">🎬 Livre 2 : Vidéos Virales avec l'IA</option>
                  </select>
                </div>

                <div className="dialog-field">
                  <label>Bénéficiaire (Optionnel) :</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Samuel WhatsApp, Partenaire concours..."
                    value={recipientNote}
                    onChange={(e) => setRecipientNote(e.target.value)}
                    className="dialog-input"
                  />
                </div>

                <div className="dialog-buttons-footer">
                  <button 
                    type="button" 
                    className="btn-dialog-cancel"
                    onClick={() => setIsFreeCodeModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-dialog-submit gold">
                    <Gift size={14} />
                    <span>Générer le Code Gratuit</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Succès de la génération */
              <div className="dialog-success-view">
                <div className="dialog-success-icon gold">
                  <Check size={22} />
                </div>
                <h5>Code Gratuit Généré !</h5>
                <span className="success-formation-sub">{modalSuccessCode.itemTitle}</span>
                
                <div className="success-code-box">
                  <code>{modalSuccessCode.code}</code>
                </div>
                <small className="success-beneficiary-sub">Bénéficiaire : {modalSuccessCode.recipientName}</small>

                <div className="success-actions-row">
                  <button 
                    className="btn-copy-tag gold"
                    onClick={() => handleCopy(modalSuccessCode.code)}
                  >
                    {copiedCode === modalSuccessCode.code ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode === modalSuccessCode.code ? 'Copié' : 'Copier Code'}</span>
                  </button>

                  <button 
                    className="btn-copy-tag green"
                    onClick={() => handleCopyWhatsAppMessage(modalSuccessCode)}
                  >
                    {whatsappCopied ? <Check size={14} /> : <Share2 size={14} />}
                    <span>{whatsappCopied ? 'Message Copié' : 'Copier Message WhatsApp'}</span>
                  </button>
                </div>

                <button 
                  className="btn-dialog-close-full"
                  onClick={() => {
                    setModalSuccessCode(null);
                    setIsFreeCodeModalOpen(false);
                  }}
                >
                  Fermer
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 2 : CRÉATION DE PROMOTEUR & CODE PROMO (FENÊTRE DÉDIÉE)
         ==================================================================== */}
      {isPromoModalOpen && (() => {
        const priceBook1 = Number(formationPrices['livre-bd-storytelling']) || 2500;
        const priceBook2 = Number(formationPrices['livre-videos-ia']) || 2500;

        const reductionPctNum = Math.min(100, Math.max(0, Number(promoterForm.reductionPct) || 0));
        const commissionPctNum = Math.min(100, Math.max(0, Number(promoterForm.commissionPct) || 0));

        // Formation 1 : BD & Storytelling
        const discount1 = Math.round((priceBook1 * reductionPctNum) / 100);
        const buyerPays1 = Math.max(0, priceBook1 - discount1);
        const promoterGain1 = Math.round((buyerPays1 * commissionPctNum) / 100);
        const mrBenGain1 = Math.max(0, buyerPays1 - promoterGain1);

        // Formation 2 : Vidéos Virales avec l'IA
        const discount2 = Math.round((priceBook2 * reductionPctNum) / 100);
        const buyerPays2 = Math.max(0, priceBook2 - discount2);
        const promoterGain2 = Math.round((buyerPays2 * commissionPctNum) / 100);
        const mrBenGain2 = Math.max(0, buyerPays2 - promoterGain2);

        return (
          <div className="modal-overlay-backdrop">
            <div className="modal-dialog-box promo">
              
              <div className="dialog-header">
                <div className="dialog-title-flex">
                  <Percent size={18} className="text-purple" />
                  <div>
                    <h4>Nouveau Promoteur & Code Promo</h4>
                    <p>Définir le promoteur, sa commission et la réduction (valable sur les 2 formations).</p>
                  </div>
                </div>
                <button 
                  className="btn-dialog-close" 
                  onClick={() => setIsPromoModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              {!promoCreatedSuccess ? (
                <form onSubmit={handleCreatePromoter} className="dialog-form-flow">
                  {promoterError && (
                    <div className="dialog-error-banner">
                      {promoterError}
                    </div>
                  )}

                  <div className="dialog-fields-row">
                    <div className="dialog-field">
                      <label>Prénom du promoteur :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Samuel"
                        value={promoterForm.prenom}
                        onChange={(e) => setPromoterForm({ ...promoterForm, prenom: e.target.value })}
                        required
                        className="dialog-input"
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Nom de famille :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Agbo"
                        value={promoterForm.nom}
                        onChange={(e) => setPromoterForm({ ...promoterForm, nom: e.target.value })}
                        required
                        className="dialog-input"
                      />
                    </div>
                  </div>

                  <div className="dialog-fields-row single-col">
                    <div className="dialog-field">
                      <label>Code Promo unique du partenaire :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: SAMUEL20 ou BEN20"
                        value={promoterForm.codePromo}
                        onChange={(e) => setPromoterForm({ ...promoterForm, codePromo: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                        required
                        className="dialog-input code-input"
                      />
                    </div>
                  </div>

                  <div className="promoter-auto-setup-notice">
                    <Sparkles size={14} className="notice-sparkle-icon" />
                    <div className="notice-text">
                      <strong>Numéro WhatsApp & Gmail renseignés par le promoteur :</strong>
                      <p>Vous n'avez pas besoin de saisir son numéro ni son e-mail. Le promoteur les enregistrera lui-même lors de sa 1ère connexion sécurisée.</p>
                    </div>
                  </div>

                  <div className="dialog-fields-row">
                    <div className="dialog-field">
                      <label>Réduction accordée à l'acheteur (%) :</label>
                      <input 
                        type="number" 
                        min="1"
                        max="90"
                        placeholder="Ex: 20"
                        value={promoterForm.reductionPct}
                        onChange={(e) => setPromoterForm({ ...promoterForm, reductionPct: e.target.value })}
                        required
                        className="dialog-input"
                      />
                    </div>

                    <div className="dialog-field">
                      <label>Commission du promoteur (%) :</label>
                      <input 
                        type="number" 
                        min="1"
                        max="90"
                        placeholder="Ex: 50"
                        value={promoterForm.commissionPct}
                        onChange={(e) => setPromoterForm({ ...promoterForm, commissionPct: e.target.value })}
                        required
                        className="dialog-input"
                      />
                    </div>
                  </div>

                  {/* CALCUL EN TEMPS RÉEL SIMULTANÉ POUR CHAQUE FORMATION */}
                  <div className="promo-live-calculator-card">
                    <div className="calc-header-badge">
                      <Calculator size={14} className="text-purple" />
                      <span>Calcul en temps réel (Appliqué automatiquement aux 2 formations) :</span>
                    </div>

                    <div className="dual-calc-container">
                      {/* Formation 1 */}
                      <div className="formation-calc-card book1">
                        <div className="formation-calc-header">
                          <span className="formation-calc-badge-tag">📕 Livre 1 : BD & Storytelling</span>
                          <span className="formation-calc-price-tag">{priceBook1.toLocaleString()} FCFA</span>
                        </div>
                        <div className="calc-metrics-grid mini">
                          <div className="calc-metric-pill buyer">
                            <span className="pill-label">L'acheteur paie</span>
                            <strong className="pill-value">{buyerPays1.toLocaleString()} F</strong>
                            <span className="pill-hint">(-{reductionPctNum}%)</span>
                          </div>
                          <div className="calc-metric-pill promoter">
                            <span className="pill-label">Gain Promoteur</span>
                            <strong className="pill-value">+{promoterGain1.toLocaleString()} F</strong>
                            <span className="pill-hint">({commissionPctNum}%)</span>
                          </div>
                          <div className="calc-metric-pill mrben">
                            <span className="pill-label">Votre part</span>
                            <strong className="pill-value">+{mrBenGain1.toLocaleString()} F</strong>
                            <span className="pill-hint">(Reste net)</span>
                          </div>
                        </div>
                      </div>

                      {/* Formation 2 */}
                      <div className="formation-calc-card book2">
                        <div className="formation-calc-header">
                          <span className="formation-calc-badge-tag">🎬 Livre 2 : Vidéos Virales IA</span>
                          <span className="formation-calc-price-tag">{priceBook2.toLocaleString()} FCFA</span>
                        </div>
                        <div className="calc-metrics-grid mini">
                          <div className="calc-metric-pill buyer">
                            <span className="pill-label">L'acheteur paie</span>
                            <strong className="pill-value">{buyerPays2.toLocaleString()} F</strong>
                            <span className="pill-hint">(-{reductionPctNum}%)</span>
                          </div>
                          <div className="calc-metric-pill promoter">
                            <span className="pill-label">Gain Promoteur</span>
                            <strong className="pill-value">+{promoterGain2.toLocaleString()} F</strong>
                            <span className="pill-hint">({commissionPctNum}%)</span>
                          </div>
                          <div className="calc-metric-pill mrben">
                            <span className="pill-label">Votre part</span>
                            <strong className="pill-value">+{mrBenGain2.toLocaleString()} F</strong>
                            <span className="pill-hint">(Reste net)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="calc-summary-sentence">
                      💡 Le code s'applique automatiquement aux <strong>2 formations</strong> : l'acheteur bénéficie de <strong>-{reductionPctNum}%</strong>, le promoteur encaisse <strong>{commissionPctNum}%</strong> du montant payé, et tout le reste vous revient directement.
                    </div>
                  </div>

                  <div className="dialog-buttons-footer">
                    <button 
                      type="button" 
                      className="btn-dialog-cancel"
                      onClick={() => setIsPromoModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn-dialog-submit purple">
                      <Percent size={14} />
                      <span>Créer ce Promoteur</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Succès création promoteur */
                <div className="dialog-success-view">
                  <div className="dialog-success-icon purple">
                    <Check size={22} />
                  </div>
                  <h5>Promoteur Configuré avec Succès !</h5>
                  <span className="success-formation-sub">{promoCreatedSuccess.prenom} {promoCreatedSuccess.nom}</span>
                  
                  <div className="promo-recap-grid four-col">
                    <div className="recap-pill">
                      <span>Code Promo</span>
                      <strong>{promoCreatedSuccess.codePromo}</strong>
                    </div>
                    <div className="recap-pill">
                      <span>Éligibilité</span>
                      <strong className="text-gold">Les 2 Livres</strong>
                    </div>
                    <div className="recap-pill">
                      <span>Réduction Élève</span>
                      <strong className="text-green">-{promoCreatedSuccess.reductionPct}%</strong>
                    </div>
                    <div className="recap-pill">
                      <span>Commission Partenaire</span>
                      <strong className="text-purple">{promoCreatedSuccess.commissionPct}%</strong>
                    </div>
                  </div>

                  <div className="portal-share-container">
                    <label>Lien personnel à envoyer à {promoCreatedSuccess.prenom} :</label>
                    <div className="portal-share-strip">
                      <code>{`${window.location.origin}/#promoteur?code=${promoCreatedSuccess.codePromo}`}</code>
                      <button 
                        className="btn-copy-strip"
                        onClick={() => handleCopyPromoterPortalLink(promoCreatedSuccess)}
                        title="Copier le lien"
                      >
                        {copiedLinkPromoter === promoCreatedSuccess.id ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                        <span>{copiedLinkPromoter === promoCreatedSuccess.id ? 'Copié !' : 'Copier le lien'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="promoter-security-notice">
                    <span>🔒 <strong>Accès sécurisé :</strong> En ouvrant ce lien, <strong>{promoCreatedSuccess.prenom}</strong> verra son prénom affiché et créera son mot de passe pour suivre ses ventes sur les deux formations.</span>
                  </div>

                  <div className="success-actions-row">
                    <button 
                      className="btn-copy-tag gold"
                      onClick={() => window.open(`${window.location.origin}/#promoteur?code=${promoCreatedSuccess.codePromo}`, '_blank')}
                    >
                      <ExternalLink size={14} />
                      <span>Ouvrir l'Espace</span>
                    </button>

                    <button 
                      className="btn-copy-tag green"
                      onClick={() => handleCopyPromoterInvitation(promoCreatedSuccess)}
                    >
                      {whatsappCopied ? <Check size={14} /> : <Share2 size={14} />}
                      <span>{whatsappCopied ? 'Message Copié !' : 'Copier Invitation WhatsApp'}</span>
                    </button>
                  </div>

                  <button 
                    className="btn-dialog-close-full"
                    onClick={() => {
                      setPromoCreatedSuccess(null);
                      setIsPromoModalOpen(false);
                    }}
                  >
                    Fermer la fenêtre
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Modale Sécurité / Modification du mot de passe Admin */}
      {isPasswordModalOpen && (() => {
        const pwdStrength = getPasswordStrength(newPasswordInput);
        return (
          <div className="modal-overlay-backdrop" onClick={() => !isSubmittingPassword && setIsPasswordModalOpen(false)}>
            <div className="modal-dialog-box security" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div className="dialog-title-flex">
                  <div className="security-icon-bubble">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4>Sécurité de la Console</h4>
                    <span className="security-modal-sub">Modifier le mot de passe administrateur</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-dialog-close" 
                  onClick={() => !isSubmittingPassword && setIsPasswordModalOpen(false)}
                  title="Fermer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="dialog-form-flow">
                {passwordChangeError && (
                  <div className="security-alert-box error">
                    <AlertCircle size={14} />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="security-alert-box success">
                    <CheckCircle2 size={14} />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                {/* Champ 1 : Mot de passe actuel */}
                <div className="dialog-field">
                  <label htmlFor="curr-pwd">Mot de passe actuel :</label>
                  <div className="dialog-pwd-wrap">
                    <input 
                      id="curr-pwd"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPasswordInput}
                      onChange={(e) => { setCurrentPasswordInput(e.target.value); setPasswordChangeError(''); }}
                      placeholder="Votre mot de passe actuel"
                      required
                      autoFocus
                    />
                    <button 
                      type="button" 
                      className="btn-pwd-eye"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                      title={showCurrentPassword ? "Masquer" : "Afficher"}
                    >
                      {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Champ 2 : Nouveau mot de passe */}
                <div className="dialog-field">
                  <label htmlFor="new-pwd">Nouveau mot de passe sécurisé :</label>
                  <div className="dialog-pwd-wrap">
                    <input 
                      id="new-pwd"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPasswordInput}
                      onChange={(e) => { setNewPasswordInput(e.target.value); setPasswordChangeError(''); }}
                      placeholder="Ex: MonCode@2026_Ultra#Ben"
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-pwd-eye"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                      title={showNewPassword ? "Masquer" : "Afficher"}
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {newPasswordInput && (
                    <div className="pwd-strength-container">
                      <div className="pwd-strength-bars">
                        <div className={`bar ${pwdStrength.level >= 1 ? 'active' : ''}`} style={{ backgroundColor: pwdStrength.level >= 1 ? pwdStrength.color : '' }} />
                        <div className={`bar ${pwdStrength.level >= 2 ? 'active' : ''}`} style={{ backgroundColor: pwdStrength.level >= 2 ? pwdStrength.color : '' }} />
                        <div className={`bar ${pwdStrength.level >= 3 ? 'active' : ''}`} style={{ backgroundColor: pwdStrength.level >= 3 ? pwdStrength.color : '' }} />
                      </div>
                      <span className="pwd-strength-text" style={{ color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Champ 3 : Confirmation */}
                <div className="dialog-field">
                  <label htmlFor="confirm-pwd">Confirmer le nouveau mot de passe :</label>
                  <div className="dialog-pwd-wrap">
                    <input 
                      id="confirm-pwd"
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => { setConfirmPasswordInput(e.target.value); setPasswordChangeError(''); }}
                      placeholder="Retapez à l'identique"
                      required
                    />
                  </div>
                </div>

                {/* Boutons d'action compacts */}
                <div className="dialog-buttons-footer">
                  <button 
                    type="button" 
                    className="btn-dialog-cancel" 
                    onClick={() => setIsPasswordModalOpen(false)}
                    disabled={isSubmittingPassword}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn-dialog-submit gold"
                    disabled={isSubmittingPassword}
                  >
                    {isSubmittingPassword ? (
                      <>
                        <Loader2 size={14} className="spin-icon" />
                        <span>Validation...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
