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
  Link2
} from 'lucide-react';
import { storageService } from '../services/storageService';
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

  // Menu latéral actif : 'overview' | 'students' | 'free_codes' | 'promo_codes'
  const [activeTab, setActiveTab] = useState('overview');

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

  // Tarifs des formations
  const [formationPrices, setFormationPrices] = useState(() => storageService.getFormationPrices());
  const [priceInputs, setPriceInputs] = useState(() => storageService.getFormationPrices());
  const [priceSuccessMsg, setPriceSuccessMsg] = useState('');

  const refreshData = async () => {
    setIsRefreshing(true);
    await storageService.initCloudSync();
    setOrders(storageService.getAllOrders());
    setStats(storageService.getAdminStats());
    setAdminCodes(storageService.getAdminGeneratedCodes());
    setPromoters(storageService.getAllPromoters());
    const currentPrices = storageService.getFormationPrices();
    setFormationPrices(currentPrices);
    setPriceInputs(currentPrices);
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

  const handleSavePrices = (e) => {
    if (e) e.preventDefault();
    const cleanBD = Math.max(0, parseInt(priceInputs['livre-bd-storytelling'], 10) || 0);
    const cleanVideo = Math.max(0, parseInt(priceInputs['livre-videos-ia'], 10) || 0);

    const updated = storageService.setFormationPrices({
      'livre-bd-storytelling': cleanBD,
      'livre-videos-ia': cleanVideo
    });

    setFormationPrices(updated);
    setPriceInputs(updated);
    setPriceSuccessMsg('✅ Prix enregistrés avec succès ! Les nouveaux tarifs sont appliqués partout en direct (Vitrine, Accueil, Lecteur et Paiements).');
    setTimeout(() => setPriceSuccessMsg(''), 5000);
  };

  const handleResetPrices = () => {
    if (window.confirm("Rétablir les prix de vente par défaut ?\n\n• BD & Storytelling : 2 500 FCFA\n• Vidéos IA : 3 100 FCFA")) {
      const reset = storageService.resetFormationPrices();
      setFormationPrices(reset);
      setPriceInputs(reset);
      setPriceSuccessMsg('🔄 Les prix par défaut ont été rétablis avec succès.');
      setTimeout(() => setPriceSuccessMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinCode.trim() === 'ben2026') {
      try {
        sessionStorage.setItem('mrben_admin_session', 'active');
      } catch {}
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError("Code incorrect.");
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
                placeholder="Mot de passe (ben2026)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                autoFocus
              />
              <button type="submit" className="lock-btn-submit">
                <span>Ouvrir</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Layout principal SaaS : Sidebar à gauche + Vue principale à droite */
        <div className="admin-saas-layout">
          
          {/* ================================================================
              SIDEBAR GAUCHE (MENU PERMANENT)
             ================================================================ */}
          <aside className="admin-left-sidebar">
            
            {/* Header Sidebar */}
            <div className="sidebar-brand-box">
              <div className="brand-logo-mark">MB</div>
              <div className="brand-text-column">
                <span className="brand-app-name">Mr Ben</span>
                <span className="brand-role-pill">Fondateur</span>
              </div>
            </div>

            {/* Menu de navigation vertical */}
            <nav className="sidebar-nav-menu">
              <span className="menu-group-label">GESTION</span>

              <button 
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                title="Vue d'ensemble et statistiques"
              >
                <BarChart3 size={16} className="nav-icon" />
                <span className="nav-text">Vue d'ensemble</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
                title="Liste des élèves et commandes"
              >
                <Users size={16} className="nav-icon" />
                <span className="nav-text">Élèves & Inscriptions</span>
                <span className="nav-badge">{stats.totalStudents}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
                title="Modifier les prix de vente des formations"
              >
                <DollarSign size={16} className="nav-icon text-gold" />
                <span className="nav-text">Tarifs & Prix</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'free_codes' ? 'active' : ''}`}
                onClick={() => setActiveTab('free_codes')}
                title="Codes d'accès 100% gratuits"
              >
                <Gift size={16} className="nav-icon" />
                <span className="nav-text">Codes Gratuits (VIP)</span>
                <span className="nav-badge">{adminCodes.length}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'promo_codes' ? 'active' : ''}`}
                onClick={() => setActiveTab('promo_codes')}
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
              ZONE DE CONTENU PRINCIPALE (À DROITE)
             ================================================================ */}
          <main className="admin-main-viewport">
            
            {/* Top Bar avec titre et icônes d'actions rapides */}
            <header className="viewport-top-header">
              <div className="header-titles">
                <h2 className="current-section-title">
                  {activeTab === 'overview' && 'Vue d\'ensemble & Statistiques'}
                  {activeTab === 'students' && 'Gestion des Élèves & Ventes'}
                  {activeTab === 'free_codes' && 'Codes d\'Accès Gratuits (Usage Unique)'}
                  {activeTab === 'promo_codes' && 'Promoteurs & Codes Promo (Affiliation)'}
                </h2>
                <span className="current-section-sub">
                  {activeTab === 'overview' && `${stats.totalStudents} élève(s) unique(s) • ${orders.length} formation(s) suivie(s)`}
                  {activeTab === 'students' && `${stats.totalStudents} compte(s) élève(s) • ${filteredOrders.length} formation(s) débloquée(s)`}
                  {activeTab === 'free_codes' && 'Déblocage direct à 100% sans paiement'}
                  {activeTab === 'promo_codes' && 'Réduction pour l\'élève + Commission pour le promoteur'}
                </span>
              </div>

              {/* Boutons icônes uniquement pour un rendu propre et épuré */}
              <div className="header-icon-actions">
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
                          <div className="pricing-current-display">
                            <span className="pricing-display-label">Prix actuel en ligne :</span>
                            <span className="pricing-display-val">
                              {(formationPrices['livre-bd-storytelling'] || 2500).toLocaleString()} FCFA
                            </span>
                          </div>

                          <div className="pricing-input-field-group">
                            <label htmlFor="price-bd">Nouveau tarif de vente :</label>
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
                          <div className="pricing-current-display">
                            <span className="pricing-display-label">Prix actuel en ligne :</span>
                            <span className="pricing-display-val">
                              {(formationPrices['livre-videos-ia'] || 3100).toLocaleString()} FCFA
                            </span>
                          </div>

                          <div className="pricing-input-field-group">
                            <label htmlFor="price-video">Nouveau tarif de vente :</label>
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
                        </div>
                      </div>
                    </div>

                    {/* Barre de Validation & Réassurance */}
                    <div className="pricing-submit-bar-card">
                      <div className="pricing-summary-info">
                        <p className="pricing-instant-reassurance">
                          ⚡ Les nouveaux prix s'appliquent immédiatement partout sur le site et FedaPay sans rechargement.
                        </p>
                      </div>

                      <div className="pricing-buttons-row">
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
                          return (
                            <tr key={p.id} className={isBlocked ? 'row-faded' : ''}>
                              <td>
                                <div className="student-info-col">
                                  <strong className="student-name">{p.prenom} {p.nom}</strong>
                                  <div className="promoter-meta-row">
                                    <span className="student-email">{p.whatsapp || 'WhatsApp non renseigné'}</span>
                                    <button 
                                      className="btn-copy-portal-inline"
                                      onClick={() => handleCopyPromoterPortalLink(p)}
                                      title="Copier le lien direct de cet espace promoteur"
                                    >
                                      {copiedLinkPromoter === p.id ? <Check size={11} className="text-green" /> : <Link2 size={11} />}
                                      <span>{copiedLinkPromoter === p.id ? 'Lien copié !' : 'Copier son lien'}</span>
                                    </button>
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

                  <div className="dialog-fields-row">
                    <div className="dialog-field">
                      <label>Code Promo à créer :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: SAMUEL20 ou BEN20"
                        value={promoterForm.codePromo}
                        onChange={(e) => setPromoterForm({ ...promoterForm, codePromo: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                        required
                        className="dialog-input code-input"
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Numéro WhatsApp :</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: +229 97 00 00 00"
                        value={promoterForm.whatsapp}
                        onChange={(e) => setPromoterForm({ ...promoterForm, whatsapp: e.target.value })}
                        className="dialog-input"
                      />
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

    </div>
  );
}
