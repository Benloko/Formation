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
import { storageService } from './services/storageService';
import { BOOKS_DATA, DUO_PACK } from './data/booksData';
import { ArrowRight, Sparkles } from 'lucide-react';
import './App.css';

// Helper pour synchroniser et analyser l'ancre URL (#formations, #services, #contact, #lecture, etc.)
const parseHash = () => {
  const hash = window.location.hash || '';
  if (!hash) return null;
  
  const cleanHash = hash.toLowerCase();
  if (hash === '#admin') {
    return { isAdmin: true };
  }
  if (cleanHash.startsWith('#promoteur') || cleanHash.startsWith('#espace-promoteur')) {
    return { isPromoter: true };
  }
  if (cleanHash.startsWith('#formation')) {
    return { tab: 'FORMATIONS' };
  }
  if (cleanHash.startsWith('#service')) {
    return { tab: 'SERVICES' };
  }
  if (cleanHash.startsWith('#contact')) {
    return { tab: 'CONTACT' };
  }
  if (cleanHash.startsWith('#about') || cleanHash.startsWith('#a-propos')) {
    return { tab: 'ABOUT' };
  }
  if (cleanHash.startsWith('#lecture') || cleanHash.startsWith('#reader')) {
    let bookId = null;
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1];
      const params = new URLSearchParams(queryStr);
      bookId = params.get('book');
    }
    return { tab: 'READER', bookId };
  }
  if (cleanHash === '#accueil' || cleanHash === '#home') {
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

  // Bannière de code promo détecté via lien d'un promoteur
  const [activePromoBanner, setActivePromoBanner] = useState(() => {
    try {
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
    const checkPromo = () => {
      try {
        const code = storageService.detectAndSavePromoFromUrl();
        if (code) {
          const promoter = storageService.getPromoterByCode(code);
          if (promoter && promoter.status !== 'BLOQUÉ') {
            setActivePromoBanner({ code, reductionPct: promoter.reductionPct });
          }
        }
      } catch {}
    };

    checkPromo();
    window.addEventListener('hashchange', checkPromo);
    window.addEventListener('mrben_promo_detected', checkPromo);
    return () => {
      window.removeEventListener('hashchange', checkPromo);
      window.removeEventListener('mrben_promo_detected', checkPromo);
    };
  }, []);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenBookUnlock = (book) => {
    const target = book || BOOKS_DATA[0];
    setSelectedBookForAction(target);
    if (storageService.isBookUnlocked(target.id)) {
      setActiveTab('READER');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Synchronisation permanente de l'URL hash et de sessionStorage lors des changements d'onglet
  React.useEffect(() => {
    try {
      sessionStorage.setItem('mrben_active_tab', activeTab);
      if (selectedBookForAction?.id) {
        sessionStorage.setItem('mrben_selected_book_id', selectedBookForAction.id);
      }
    } catch {}

    let newHash = '';
    if (activeTab === 'FORMATIONS') newHash = '#formations';
    else if (activeTab === 'SERVICES') newHash = '#services';
    else if (activeTab === 'CONTACT') newHash = '#contact';
    else if (activeTab === 'ABOUT') newHash = '#a-propos';
    else if (activeTab === 'READER') {
      newHash = selectedBookForAction?.id 
        ? `#lecture?book=${encodeURIComponent(selectedBookForAction.id)}` 
        : '#lecture';
    } else {
      newHash = '';
    }

    // Ne pas écraser le hash si l'admin est ouvert via #admin
    if (window.location.hash !== '#admin') {
      if (newHash === '') {
        if (window.location.hash && window.location.hash !== '#') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  }, [activeTab, selectedBookForAction]);

  // Écouteur pour navigation par l'historique (boutons précédent/suivant) et raccourcis
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
        return;
      }
      if ((window.location.hash || '').toLowerCase().startsWith('#promoteur')) {
        setIsPromoterOpen(true);
        return;
      }
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
            setIsCheckoutOpen(true);
            return;
          }
        }
        setActiveTab(parsed.tab);
        if (parsed.bookId) {
          const found = BOOKS_DATA.find(b => b.id === parsed.bookId);
          if (found) setSelectedBookForAction(found);
        }
      } else if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#accueil') {
        setActiveTab('HOME');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="home-screen-container">
      {/* 1. Header avec logo rond MR et navigation */}
      <Header 
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAbout={() => setActiveTab('ABOUT')}
        onOpenAdmin={() => setIsAdminOpen(true)}
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
                    onClick={() => setActiveTab('FORMATIONS')}
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
                  onClick={() => setActiveTab('FORMATIONS')}
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
          onClose={() => setActiveTab('HOME')}
          onUnlockBook={handleOpenBookUnlock}
          onOpenCheckout={(book) => {
            setSelectedBookForAction(book || BOOKS_DATA[0]);
            setIsCheckoutOpen(true);
          }}
          onGoToServices={() => setActiveTab('SERVICES')}
        />
      )}

      {/* 5. VUE SERVICES : GRANDE PAGE UNIQUE DU LIVRE D'ART PROPRE ET ÉLÉGANTE */}
      {activeTab === 'SERVICES' && (
        <ServicesBookView onClose={() => setActiveTab('HOME')} />
      )}

      {/* 6. VUE CONTACT / À PROPOS : GRANDE PAGE DU LIVRE D'ART PROPRE ET ÉLÉGANTE */}
      {(activeTab === 'CONTACT' || activeTab === 'ABOUT') && (
        <ContactBookView onClose={() => setActiveTab('HOME')} />
      )}

      {/* 7. VUE LECTEUR DE FORMATION DÉBLOQUÉE */}
      {activeTab === 'READER' && (
        <div className="reader-view-overlay">
          <BookReader 
            book={selectedBookForAction}
            isUnlocked={storageService.isBookUnlocked(selectedBookForAction?.id)}
            activeCode={storageService.getLoggedInGmail() || "Accès à vie"}
            onBack={() => setActiveTab('FORMATIONS')}
            onClose={() => setActiveTab('FORMATIONS')}
            onOpenCheckout={(targetBk) => {
              if (targetBk) setSelectedBookForAction(targetBk);
              setIsCheckoutOpen(true);
            }}
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
            setActiveTab('READER');
          }}
        />
      )}

      {/* Modale d'activation avec Google & Livre 3D Débloqué */}
      {isCheckoutOpen && (
        <CheckoutModal 
          book={selectedBookForAction}
          item={selectedBookForAction}
          onClose={() => setIsCheckoutOpen(false)}
          onOpenTraining={(book) => {
            if (book) setSelectedBookForAction(book);
            setIsCheckoutOpen(false);
            setActiveTab('READER');
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
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Espace Partenaire Promoteur Mr Ben */}
      {isPromoterOpen && (
        <PromoterPortal onClose={() => {
          setIsPromoterOpen(false);
          if ((window.location.hash || '').toLowerCase().startsWith('#promoteur')) {
            window.location.hash = '';
          }
        }} />
      )}
    </div>
  );
}

export default App;
