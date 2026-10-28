import React, { useState } from 'react';
import { Header } from './components/Header';
import { TypewriterMessage } from './components/TypewriterMessage';
import { AnimatedStickers } from './components/AnimatedStickers';
import { FormationsBookView } from './components/FormationsBookView';
import { UnlockModal } from './components/UnlockModal';
import { ServicesBookView } from './components/ServicesBookView';
import { ContactBookView } from './components/ContactBookView';
import { CheckoutModal } from './components/CheckoutModal';
import { BonusModal } from './components/BonusModal';
import { BookReader } from './components/BookReader';
import { AdminDashboard } from './components/AdminDashboard';
import { PromoterPortal } from './components/PromoterPortal';
import { InAppBrowserBanner } from './components/InAppBrowserBanner';
import { detectInAppBrowser } from './utils/inAppBrowser';
import { storageService } from './services/storageService';
import { analyticsService } from './services/analyticsService';
import { BOOKS_DATA, DUO_PACK } from './data/booksData';
import { ArrowRight, Sparkles } from 'lucide-react';
import './App.css';

// Helper pour synchroniser et analyser l'ancre URL (#formations, #services, #contact, #lecture, etc.) ou paramètres de requête
const parseHash = () => {
  const hash = window.location.hash || '';
  let tabParam = '';
  try {
    if (typeof window !== 'undefined' && window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      tabParam = (sp.get('tab') || sp.get('view') || '').toLowerCase();
    }
  } catch {}

  const cleanHash = (hash || '').toLowerCase();
  if (hash === '#admin' || tabParam === 'admin') {
    return { isAdmin: true };
  }
  if (cleanHash.startsWith('#promoteur') || cleanHash.startsWith('#espace-promoteur') || tabParam === 'promoteur') {
    return { isPromoter: true };
  }
  if (cleanHash.startsWith('#formation') || tabParam === 'formation' || tabParam === 'formations') {
    return { tab: 'FORMATIONS' };
  }
  if (cleanHash.startsWith('#service') || tabParam === 'service' || tabParam === 'services') {
    return { tab: 'SERVICES' };
  }
  if (cleanHash.startsWith('#contact') || tabParam === 'contact') {
    return { tab: 'CONTACT' };
  }
  if (cleanHash.startsWith('#about') || cleanHash.startsWith('#a-propos') || tabParam === 'about') {
    return { tab: 'ABOUT' };
  }
  if (cleanHash.startsWith('#lecture') || cleanHash.startsWith('#reader') || tabParam === 'reader' || tabParam === 'lecture') {
    let bookId = null;
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1];
      const params = new URLSearchParams(queryStr);
      bookId = params.get('book');
    }
    return { tab: 'READER', bookId };
  }
  if (cleanHash === '#accueil' || cleanHash === '#home' || tabParam === 'home') {
    return { tab: 'HOME' };
  }
  return null;
};

export function App() {
  // Restauration intelligente de l'état de navigation au rechargement (F5 / Refresh)
  const getInitialNavigation = () => {
    const fromHash = parseHash();
    if (fromHash?.tab) {
      let book = BOOKS_DATA[0];
      if (fromHash.bookId) {
        const found = BOOKS_DATA.find(b => b.id === fromHash.bookId);
        if (found) book = found;
      }

      // Règle de sécurité : si accès direct à #lecture sans avoir débloqué la formation
      if (fromHash.tab === 'READER' && !storageService.isBookUnlocked(book.id)) {
        return { tab: 'FORMATIONS', book, openCheckout: true };
      }

      return { tab: fromHash.tab, book };
    }

    try {
      const savedTab = sessionStorage.getItem('mrben_active_tab');
      const savedBookId = sessionStorage.getItem('mrben_selected_book_id');
      if (savedTab) {
        let book = BOOKS_DATA[0];
        if (savedBookId) {
          const found = BOOKS_DATA.find(b => b.id === savedBookId);
          if (found) book = found;
        }

        if (savedTab === 'READER' && !storageService.isBookUnlocked(book.id)) {
          return { tab: 'FORMATIONS', book };
        }

        return { tab: savedTab, book };
      }
    } catch {}

    return { tab: 'HOME', book: BOOKS_DATA[0] };
  };

  const initialNav = React.useMemo(() => getInitialNavigation(), []);
  const [activeTab, setActiveTab] = useState(initialNav.tab);
  const [selectedBookForAction, setSelectedBookForAction] = useState(initialNav.book);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(() => initialNav.openCheckout || false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => window.location.hash === '#admin');
  const [isPromoterOpen, setIsPromoterOpen] = useState(() => (window.location.hash || '').toLowerCase().startsWith('#promoteur'));

  // Détection des navigateurs intégrés (Facebook Lite, Instagram, TikTok) pour masquer l'interface
  const [isInAppActive, setIsInAppActive] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mrben_skip_inapp_guard') === 'true') {
        return false;
      }
      return detectInAppBrowser().isInApp;
    } catch {
      return false;
    }
  });

  // Bannière de code promo détecté via lien d'un promoteur (UNIQUEMENT si l'URL courante comporte un lien promo)
  const [activePromoBanner, setActivePromoBanner] = useState(() => {
    try {
      const hasPromoInUrl = (typeof window !== 'undefined') && (
        (window.location.search && window.location.search.includes('promo=')) ||
        (window.location.hash && window.location.hash.includes('promo='))
      );
      if (!hasPromoInUrl) {
        return null;
      }
      const code = storageService.detectAndSavePromoFromUrl();
      if (code) {
        const promoter = storageService.getPromoterByCode(code);
        if (promoter && promoter.status !== 'BLOQUÉ') {
          return { code, reductionPct: promoter.reductionPct };
        }
      }
    } catch {}
    return null;
  });

  React.useEffect(() => {
    // Synchronisation initiale et périodique avec le cloud Hostinger
    storageService.initCloudSync();
    const syncInterval = setInterval(() => {
      storageService.initCloudSync();
    }, 60000);

    const onWindowFocus = () => {
      storageService.initCloudSync();
    };
    window.addEventListener('focus', onWindowFocus);

    const checkPromo = () => {
      try {
        const hasPromoInUrl = (typeof window !== 'undefined') && (
          (window.location.search && window.location.search.includes('promo=')) ||
          (window.location.hash && window.location.hash.includes('promo='))
        );
        if (!hasPromoInUrl) {
          setActivePromoBanner(null);
          return;
        }
        const code = storageService.detectAndSavePromoFromUrl();
        if (code) {
          const promoter = storageService.getPromoterByCode(code);
          if (promoter && promoter.status !== 'BLOQUÉ') {
            setActivePromoBanner({ code, reductionPct: promoter.reductionPct });
            return;
          }
        }
        setActivePromoBanner(null);
      } catch {
        setActivePromoBanner(null);
      }
    };

    const onPromoCleared = () => {
      setActivePromoBanner(null);
    };

    checkPromo();
    window.addEventListener('hashchange', checkPromo);
    window.addEventListener('mrben_promo_detected', checkPromo);
    window.addEventListener('mrben_promo_cleared', onPromoCleared);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('hashchange', checkPromo);
      window.removeEventListener('mrben_promo_detected', checkPromo);
      window.removeEventListener('mrben_promo_cleared', onPromoCleared);
    };
  }, []);

  // Suivi analytics automatique de la vue active & lecture d'extraits
  React.useEffect(() => {
    const formationId = selectedBookForAction?.id || '';
    if (activeTab === 'READER') {
      analyticsService.trackDemoRead(formationId || 'lecture-demo');
    } else {
      analyticsService.trackPageView(window.location.pathname + (window.location.hash || ''), formationId);
    }
  }, [activeTab]);

  const getTabHash = (tab, book = null) => {
    if (tab === 'FORMATIONS') return '#formations';
    if (tab === 'SERVICES') return '#services';
    if (tab === 'CONTACT') return '#contact';
    if (tab === 'ABOUT') return '#a-propos';
    if (tab === 'READER') {
      const bId = book?.id || selectedBookForAction?.id;
      return bId ? `#lecture?book=${encodeURIComponent(bId)}` : '#lecture';
    }
    return '';
  };

  const handleSelectTab = (tab, book = null) => {
    if (tab === activeTab && !book) return;

    const newHash = getTabHash(tab, book);
    const targetUrl = newHash || window.location.pathname;

    // Si on change de vue, on ajoute une entrée dans l'historique du navigateur
    if (window.location.hash !== newHash) {
      window.history.pushState({ tab, bookId: book?.id }, '', targetUrl);
    }

    if (book) {
      setSelectedBookForAction(book);
      if (tab === 'FORMATIONS') {
        analyticsService.trackFormationView(book.id);
      }
    }
    setActiveTab(tab);
  };

  const handleCloseView = () => {
    if (activeTab === 'READER') {
      handleSelectTab('FORMATIONS');
    } else {
      if (window.location.hash && window.history.length > 1) {
        window.history.back();
      } else {
        handleSelectTab('HOME');
      }
    }
  };

  const handleOpenBookUnlock = (book) => {
    const target = book || BOOKS_DATA[0];
    setSelectedBookForAction(target);
    analyticsService.trackUnlockClick(target.id);

    if (storageService.isBookUnlocked(target.id)) {
      handleSelectTab('READER', target);
    } else {
      window.history.pushState({ modal: 'checkout', bookId: target.id }, '', window.location.hash || '#formations');
      setIsCheckoutOpen(true);
    }
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (window.history.state?.modal === 'checkout') {
      try {
        window.history.back();
      } catch {}
    }
  };

  const handleOpenAdmin = () => {
    window.history.pushState({ modal: 'admin' }, '', '#admin');
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.location.hash === '#admin' || window.history.state?.modal === 'admin') {
      window.history.back();
    } else {
      setIsAdminOpen(false);
    }
  };

  const handleOpenPromoter = () => {
    window.history.pushState({ modal: 'promoter' }, '', '#promoteur');
    setIsPromoterOpen(true);
  };

  const handleClosePromoter = () => {
    if ((window.location.hash || '').toLowerCase().startsWith('#promoteur') || window.history.state?.modal === 'promoter') {
      window.history.back();
    } else {
      setIsPromoterOpen(false);
    }
  };

  // Initialisation de l'historique au montage (évite de fermer le site sur retour téléphone)
  React.useEffect(() => {
    const initialHash = window.location.hash;
    if (initialHash && initialHash !== '#' && initialHash !== '#accueil') {
      window.history.replaceState({ tab: 'HOME' }, '', window.location.pathname);
      window.history.pushState({ tab: initialNav.tab }, '', initialHash);
    } else {
      window.history.replaceState({ tab: 'HOME' }, '', window.location.pathname);
    }
  }, []);

  // Synchronisation de sessionStorage
  React.useEffect(() => {
    try {
      sessionStorage.setItem('mrben_active_tab', activeTab);
      if (selectedBookForAction?.id) {
        sessionStorage.setItem('mrben_selected_book_id', selectedBookForAction.id);
      }
    } catch {}
  }, [activeTab, selectedBookForAction]);

  // Écouteur pour la navigation par bouton Retour système du téléphone (Android / iOS Swipe)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    const handleHistoryPop = () => {
      // 1. Si une modale est ouverte, le bouton retour du téléphone la ferme sans quitter le site
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }
      if (isUnlockOpen) {
        setIsUnlockOpen(false);
        return;
      }
      if (isBonusOpen) {
        setIsBonusOpen(false);
        return;
      }
      if (isPromoterOpen) {
        setIsPromoterOpen(false);
        return;
      }
      if (isAdminOpen) {
        setIsAdminOpen(false);
        return;
      }

      // 2. Gestion des ancres spécifiques
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
        return;
      }
      if ((window.location.hash || '').toLowerCase().startsWith('#promoteur')) {
        setIsPromoterOpen(true);
        return;
      }

      // 3. Navigation d'onglet fluide
      const parsed = parseHash();
      if (parsed?.tab) {
        if (parsed.tab === 'READER') {
          let book = BOOKS_DATA[0];
          if (parsed.bookId) {
            const found = BOOKS_DATA.find(b => b.id === parsed.bookId);
            if (found) book = found;
          }
          if (!storageService.isBookUnlocked(book.id)) {
            setActiveTab('FORMATIONS');
            setSelectedBookForAction(book);
            return;
          }
        }
        setActiveTab(parsed.tab);
        if (parsed.bookId) {
          const found = BOOKS_DATA.find(b => b.id === parsed.bookId);
          if (found) setSelectedBookForAction(found);
        }
      } else {
        // Retour sur la page d'accueil sans fermer le site
        setActiveTab('HOME');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handleHistoryPop);
    window.addEventListener('hashchange', handleHistoryPop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handleHistoryPop);
      window.removeEventListener('hashchange', handleHistoryPop);
    };
  }, [isCheckoutOpen, isUnlockOpen, isBonusOpen, isPromoterOpen, isAdminOpen]);

  if (isInAppActive) {
    return <InAppBrowserBanner onBypass={() => setIsInAppActive(false)} />;
  }

  return (
    <div className="home-screen-container">
      {/* 1. Header avec logo rond MR et navigation */}
      <Header 
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAbout={() => handleSelectTab('CONTACT')}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 2. Photo d'accueil qui prend tout l'écran */}
      <div className="full-screen-image-wrapper">
        <img 
          src="/hero-book.jpg" 
          alt="Mr Ben Story Book" 
          className="full-screen-hero-photo"
        />
        <div className="vignette-overlay"></div>
      </div>

      {/* 3. VUE PRINCIPALE D'ACCUEIL */}
      {activeTab === 'HOME' && (
        <>
          {/* Message animé avec saisie manuscrite à la main ✍️ */}
          <TypewriterMessage />

          {/* Stickers de personnages animés (Garçon & Fille) */}
          <AnimatedStickers />

          {/* Bouton en bas : "Débloquer ma formation" (adapté si déjà débloqué ou avec code promo) */}
          <div className="bottom-cta-container">
            {(() => {
              const isBDUnlocked = storageService.isBookUnlocked('livre-bd-storytelling');
              const isVideoUnlocked = storageService.isBookUnlocked('livre-videos-ia');
              const isAllUnlocked = isBDUnlocked && isVideoUnlocked;
              const isOneUnlocked = (isBDUnlocked && !isVideoUnlocked) || (!isBDUnlocked && isVideoUnlocked);

              if (isAllUnlocked) {
                return (
                  <button 
                    className="btn-unlock-formation book-already-unlocked-cta"
                    onClick={() => handleSelectTab('FORMATIONS')}
                  >
                    <span className="shimmer-sweep-ray"></span>
                    <Sparkles size={14} className="cta-sparkle-icon" />
                    <span className="btn-text-content">Accéder à mes formations</span>
                    <ArrowRight size={14} className="cta-arrow-icon" />
                  </button>
                );
              }

              const buttonTitle = isOneUnlocked ? "Débloquer la 2ème formation" : "Débloquer ma formation";

              return (
                <button 
                  className={`btn-unlock-formation ${activePromoBanner ? 'has-promo' : ''}`}
                  onClick={() => {
                    analyticsService.trackButtonClick('btn_cta_home', 'all', '/');
                    handleSelectTab('FORMATIONS');
                  }}
                >
                  <span className="shimmer-sweep-ray"></span>
                  <Sparkles size={activePromoBanner ? 16 : 14} className="cta-sparkle-icon" />
                  {activePromoBanner ? (
                    <div className="btn-promo-content-group">
                      <div className="btn-promo-main-row">
                        <span className="btn-text-content">{buttonTitle}</span>
                        <span className="btn-promo-discount-badge">-{activePromoBanner.reductionPct}%</span>
                      </div>
                      <span className="btn-promo-callout">
                        Code <strong>{activePromoBanner.code}</strong> appliqué • Cliquez pour voir
                      </span>
                    </div>
                  ) : (
                    <span className="btn-text-content">{buttonTitle}</span>
                  )}
                  <ArrowRight size={activePromoBanner ? 16 : 14} className="cta-arrow-icon" />
                </button>
              );
            })()}
          </div>
        </>
      )}

      {/* 4. VUE FORMATIONS : LE GRAND LIVRE BLANC OUVERT PLEIN ÉCRAN AVEC RUBAN ROUGE */}
      {activeTab === 'FORMATIONS' && (
        <FormationsBookView 
          activePromo={activePromoBanner}
          onClose={handleCloseView}
          onUnlockBook={handleOpenBookUnlock}
          onOpenCheckout={handleOpenBookUnlock}
          onGoToServices={() => handleSelectTab('SERVICES')}
        />
      )}

      {/* 5. VUE SERVICES : GRANDE PAGE UNIQUE DU LIVRE D'ART PROPRE ET ÉLÉGANTE */}
      {activeTab === 'SERVICES' && (
        <ServicesBookView onClose={handleCloseView} />
      )}

      {/* 6. VUE CONTACT / À PROPOS : GRANDE PAGE DU LIVRE D'ART PROPRE ET ÉLÉGANTE */}
      {(activeTab === 'CONTACT' || activeTab === 'ABOUT') && (
        <ContactBookView onClose={handleCloseView} />
      )}

      {/* 7. VUE LECTEUR DE FORMATION DÉBLOQUÉE */}
      {activeTab === 'READER' && (
        <div className="reader-view-overlay">
          <BookReader 
            book={selectedBookForAction}
            isUnlocked={storageService.isBookUnlocked(selectedBookForAction?.id)}
            activeCode={storageService.getLoggedInGmail() || "Accès à vie"}
            onBack={handleCloseView}
            onClose={handleCloseView}
            onOpenCheckout={(targetBk) => handleOpenBookUnlock(targetBk)}
            onSelectBook={(newBook) => {
              if (newBook) {
                setSelectedBookForAction(newBook);
              }
            }}
          />
        </div>
      )}

      {/* Modale de déverrouillage par code d'accès */}
      {isUnlockOpen && (
        <UnlockModal 
          onClose={() => setIsUnlockOpen(false)}
          onUnlocked={(order) => {
            setIsUnlockOpen(false);
            if (order && order.itemId) {
              const matched = BOOKS_DATA.find(b => b.id === order.itemId);
              if (matched) setSelectedBookForAction(matched);
            }
            handleSelectTab('READER');
          }}
        />
      )}

      {/* Modale d'activation avec Google & Livre 3D Débloqué */}
      {isCheckoutOpen && (
        <CheckoutModal 
          book={selectedBookForAction}
          item={selectedBookForAction}
          onClose={handleCloseCheckout}
          onOpenTraining={(book) => {
            if (book) setSelectedBookForAction(book);
            setIsCheckoutOpen(false);
            handleSelectTab('READER', book);
          }}
        />
      )}

      {/* Modale bonus */}
      {isBonusOpen && (
        <BonusModal 
          activeCode={storageService.getActiveCodeForBook(selectedBookForAction.id) || storageService.getLoggedInGmail()}
          onClose={() => setIsBonusOpen(false)} 
        />
      )}

      {/* Espace Administrateur Mr Ben (Dashboard & Générateur de Codes Sécurisés) */}
      {isAdminOpen && (
        <AdminDashboard onClose={handleCloseAdmin} />
      )}

      {/* Espace Partenaire Promoteur Mr Ben */}
      {isPromoterOpen && (
        <PromoterPortal onClose={handleClosePromoter} />
      )}
    </div>
  );
}

export default App;
