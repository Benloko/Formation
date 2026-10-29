import React, { useState, useEffect } from 'react';
import { BOOKS_DATA } from '../data/booksData';
import { storageService } from '../services/storageService';
import { analyticsService } from '../services/analyticsService';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Eye, 
  Play, 
  Handshake,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { currencyService } from '../services/currencyService';
import './FormationsBookView.css';

const BD_GALLERY = [
  { id: 1, img: '/images/formation/bd-exemples/image1.jpeg', alt: 'Scène 1' },
  { id: 2, img: '/images/formation/bd-exemples/image2.jpeg', alt: 'Scène 2' },
  { id: 3, img: '/images/formation/bd-exemples/image3.jpeg', alt: 'Scène 3' },
  { id: 4, img: '/images/formation/bd-exemples/image4.jpeg', alt: 'Scène 4' },
];

const VIDEO_GALLERY = [
  { 
    id: 1, 
    video: '/images/formation/video-exemple/sante.mp4', 
    poster: '/images/formation/bd-exemples/image1.jpeg',
    alt: 'Extrait Vidéo' 
  },
];

export function FormationsBookView({ onClose, onUnlockBook, onGoToServices, activePromo: propActivePromo }) {
  const [mobileActiveTab, setMobileActiveTab] = useState('bd'); // 'bd' | 'video'
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());
  const [originalPrices, setOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [lightbox, setLightbox] = useState(null); // null | { type: 'bd' | 'video', index: number }
  const [teaserBdIndex, setTeaserBdIndex] = useState(0);
  const teaserVideoRef = React.useRef(null);

  // Mettre en pause la vidéo d'aperçu d'arrière-plan quand la lightbox est ouverte
  useEffect(() => {
    if (teaserVideoRef.current) {
      if (lightbox) {
        teaserVideoRef.current.pause();
      } else {
        teaserVideoRef.current.play().catch(() => {});
      }
    }
  }, [lightbox]);

  // Défilement automatique des scènes BD chaque 2 secondes sur la carte d'aperçu
  useEffect(() => {
    const timer = setInterval(() => {
      setTeaserBdIndex((prev) => (prev + 1) % BD_GALLERY.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const getUrlReductionPct = () => {
    try {
      if (typeof window === 'undefined') return 20;
      let pct = null;
      if (window.location.search) {
        pct = new URLSearchParams(window.location.search).get('pct');
      }
      if (!pct && window.location.hash && window.location.hash.includes('pct=')) {
        const queryStr = window.location.hash.includes('?') 
          ? window.location.hash.split('?')[1] 
          : window.location.hash.replace('#', '');
        pct = new URLSearchParams(queryStr).get('pct');
      }
      return pct ? Math.max(1, Math.min(90, parseInt(pct, 10) || 20)) : 20;
    } catch {
      return 20;
    }
  };

  const [activePromo, setActivePromo] = useState(() => {
    if (propActivePromo) return propActivePromo;
    try {
      const code = storageService.getPendingPromoCode() || storageService.detectAndSavePromoFromUrl();
      if (code) {
        const promoter = storageService.getPromoterByCode(code);
        if (promoter?.status === 'BLOQUÉ') return null;
        const pct = (promoter && promoter.reductionPct) ? promoter.reductionPct : getUrlReductionPct();
        return {
          code: promoter?.codePromo || code,
          reductionPct: pct,
          targetBookId: promoter?.targetBookId || 'all'
        };
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (propActivePromo) {
      setActivePromo(propActivePromo);
    }
  }, [propActivePromo]);

  useEffect(() => {
    const updatePrices = (e) => {
      setPrices(e.detail?.prices || storageService.getFormationPrices());
      setOriginalPrices(e.detail?.originalPrices || storageService.getFormationOriginalPrices());
    };
    const updateCurrency = (e) => {
      setCurrentCountry(e.detail || currencyService.getCurrentCountry());
    };

    const updatePromo = (e) => {
      try {
        const eventDetail = e?.detail;
        const code = eventDetail?.code || storageService.getPendingPromoCode() || storageService.detectAndSavePromoFromUrl();
        if (code) {
          const promoter = storageService.getPromoterByCode(code);
          if (promoter?.status === 'BLOQUÉ') {
            setActivePromo(null);
            return;
          }
          const pct = eventDetail?.pct || ((promoter && promoter.reductionPct) ? promoter.reductionPct : getUrlReductionPct());
          setActivePromo({
            code: promoter?.codePromo || code,
            reductionPct: pct,
            targetBookId: promoter?.targetBookId || 'all'
          });
          return;
        }
        setActivePromo(null);
      } catch {
        setActivePromo(null);
      }
    };

    const onPromoCleared = () => {
      setActivePromo(null);
    };

    window.addEventListener('mrben_price_changed', updatePrices);
    window.addEventListener('mrben_currency_changed', updateCurrency);
    window.addEventListener('mrben_promo_detected', updatePromo);
    window.addEventListener('mrben_promo_cleared', onPromoCleared);
    window.addEventListener('storage', () => {
      setPrices(storageService.getFormationPrices());
      setOriginalPrices(storageService.getFormationOriginalPrices());
      updatePromo();
    });
    return () => {
      window.removeEventListener('mrben_price_changed', updatePrices);
      window.removeEventListener('mrben_currency_changed', updateCurrency);
      window.removeEventListener('mrben_promo_detected', updatePromo);
      window.removeEventListener('mrben_promo_cleared', onPromoCleared);
    };
  }, []);

  // Gestion des touches clavier pour le Lightbox (Échap, Flèches Gauche/Droite)
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightbox(null);
      } else if (e.key === 'ArrowRight') {
        setLightbox((prev) => {
          if (!prev) return null;
          const gallery = prev.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY;
          return { ...prev, index: (prev.index + 1) % gallery.length };
        });
      } else if (e.key === 'ArrowLeft') {
        setLightbox((prev) => {
          if (!prev) return null;
          const gallery = prev.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY;
          return { ...prev, index: (prev.index - 1 + gallery.length) % gallery.length };
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  const handleNextSlide = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => {
      if (!prev) return null;
      const gallery = prev.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY;
      return { ...prev, index: (prev.index + 1) % gallery.length };
    });
  };

  const handlePrevSlide = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => {
      if (!prev) return null;
      const gallery = prev.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY;
      return { ...prev, index: (prev.index - 1 + gallery.length) % gallery.length };
    });
  };

  const bookBD = BOOKS_DATA.find((b) => b.id === 'livre-bd-storytelling') || BOOKS_DATA[0];
  const bookVideo = BOOKS_DATA.find((b) => b.id === 'livre-videos-ia') || BOOKS_DATA[1];

  const isBDUnlocked = storageService.isBookUnlocked(bookBD.id);
  const isVideoUnlocked = storageService.isBookUnlocked(bookVideo.id);

  // Prix et réductions : le prix barré doit TOUJOURS être le prix d'origine haut (origBdPrice / origVideoPrice)
  const baseBdPrice = prices['livre-bd-storytelling'] || 2500;
  const origBdPrice = originalPrices['livre-bd-storytelling'] || 5000;
  const isBdEligible = activePromo && (!activePromo.targetBookId || activePromo.targetBookId === 'all' || activePromo.targetBookId === bookBD.id);
  const bdReductionPct = isBdEligible ? (activePromo.reductionPct || 0) : 0;
  const finalBdPrice = bdReductionPct > 0 
    ? Math.max(0, Math.round(baseBdPrice * (1 - bdReductionPct / 100))) 
    : baseBdPrice;
  const bdPair = currencyService.formatPricePair(finalBdPrice, origBdPrice);

  const baseVideoPrice = prices['livre-videos-ia'] || 3100;
  const origVideoPrice = originalPrices['livre-videos-ia'] || 6000;
  const isVideoEligible = activePromo && (!activePromo.targetBookId || activePromo.targetBookId === 'all' || activePromo.targetBookId === bookVideo.id);
  const videoReductionPct = isVideoEligible ? (activePromo.reductionPct || 0) : 0;
  const finalVideoPrice = videoReductionPct > 0 
    ? Math.max(0, Math.round(baseVideoPrice * (1 - videoReductionPct / 100))) 
    : baseVideoPrice;
  const videoPair = currencyService.formatPricePair(finalVideoPrice, origVideoPrice);

  return (
    <div className="formations-book-viewport">
      {/* Sélecteur mobile (visible uniquement sur petit écran) */}
      <div className="book-mobile-tab-switch">
        <button 
          className={`mobile-tab-btn ${mobileActiveTab === 'bd' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('bd')}
        >
          <span>🎨 Bandes dessinées</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileActiveTab === 'video' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('video')}
        >
          <span>🎬 Vidéos avec l'IA</span>
        </button>
      </div>

      {/* CONTENEUR DU LIVRE OUVERT */}
      <div className="book-multipage-wrapper">
        <div className="book-pages-stack-edge left-edge" aria-hidden="true"></div>
        <div className="book-pages-stack-edge right-edge" aria-hidden="true"></div>

        <div className="open-book-spread ivory-book-theme">
          {/* Croix de fermeture en haut à droite */}
          <button 
            className="book-close-red-cross"
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* Ruban rouge marque-page */}
          <div className="red-ribbon-bookmark" aria-hidden="true">
            <div className="ribbon-tail"></div>
          </div>

          {/* Reliure centrale */}
          <div className="book-center-spine" aria-hidden="true"></div>

          {/* ====================================================================
              PAGE DE GAUCHE : FORMATION 1 (BANDES DESSINÉES)
              ==================================================================== */}
          <div className={`book-page left-page ${mobileActiveTab === 'bd' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="page-inner-content page-fade-in">
              {/* LIVRE 3D EN HAUT : CLIC SUR LE LIVRE OU LE BADGE OUVRE/DÉBLOQUE */}
              <div className="book-floating-hero">
                <div className="book-halo-glow" aria-hidden="true"></div>
                <img 
                  src="/books/book_bd_cover.png" 
                  alt="Livre BD & Storytelling" 
                  className="book-rotating-3d clickable-book-cover"
                  onClick={() => onUnlockBook({ ...bookBD, price: isBDUnlocked ? baseBdPrice : finalBdPrice, originalPrice: origBdPrice })}
                  style={{ cursor: 'pointer' }}
                  title={isBDUnlocked ? "Cliquer pour ouvrir la formation débloquée" : "Cliquer pour débloquer cette formation"}
                />
                
                {/* Badge de prix cliquable sous le livre */}
                <div 
                  className={`book-price-badge-animated ${isBDUnlocked ? 'is-unlocked' : ''}`}
                  onClick={() => onUnlockBook({ ...bookBD, price: isBDUnlocked ? baseBdPrice : finalBdPrice, originalPrice: origBdPrice })}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  title={isBDUnlocked ? "Cliquer pour ouvrir la formation débloquée" : "Cliquer pour débloquer cette formation"}
                >
                  {isBDUnlocked ? (
                    <span className="price-tag-unlocked">✓ Formation Débloquée</span>
                  ) : (
                    <div className="book-price-strikethrough-wrap">
                      <span className="price-tag-struck">{bdPair.originalFormatted}</span>
                      <span className="price-tag-gold">{bdPair.currentFormatted}</span>
                      {bdReductionPct > 0 && (
                        <span className="badge-promo-chip">-{bdReductionPct}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Titre & Accroche claire */}
              <div className="formation-intro-block">
                <h2 className="formation-book-title">
                  L'Art du Storytelling & Bandes Dessinées
                </h2>
                <p className="formation-catchy-lead">
                  Apprenez à créer vos propres histoires illustrées et bâtissez une audience fidèle directement depuis votre smartphone.
                </p>

                {/* Badges Clés avec Émojis Rebondissants */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <span className="floating-emoji">📱</span>
                    <span>100% sur Smartphone</span>
                  </div>
                  <div className="key-pill pill-free">
                    <span className="floating-emoji">🆓</span>
                    <span>Outils IA 100% Gratuits</span>
                  </div>
                </div>
              </div>

              {/* CARTE D'APERÇU ANIMÉE UNIQUE EN HAUT (IMAGES DÉFILANT TOUTES LES 2 SECONDES) */}
              <div 
                className="formation-top-teaser-card"
                onClick={() => {
                  analyticsService.trackButtonClick('teaser_card_click_bd', 'livre-bd-storytelling', '#formations');
                  setLightbox({ type: 'bd', index: teaserBdIndex });
                }}
                role="button"
                tabIndex={0}
                title="Cliquer pour regarder en grand format"
              >
                <div className="teaser-card-media-wrap">
                  <img 
                    key={teaserBdIndex}
                    src={BD_GALLERY[teaserBdIndex].img} 
                    alt={`Aperçu BD - Scène ${teaserBdIndex + 1}`} 
                    className="teaser-card-img teaser-card-cycle-anim"
                  />
                  <div className="teaser-card-glow-pulse" aria-hidden="true"></div>
                  <div className="teaser-card-overlay">
                    <span className="teaser-simple-tag">Extrait</span>
                    <div className="teaser-cta-pill">
                      <span>Regarder</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LES 4 MODULES ANIMÉS GROUPÉS EN BAS */}
              <div className="formation-vertical-cards-stack">
                {/* Module 1 */}
                <div className="animated-pillar-row-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-amber">
                      <span className="floating-emoji">💡</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge">Module 1</span>
                      <h4 className="pillar-main-title">Imaginer des Scénarios & Créer Votre Personnage</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    La méthode simple pour concevoir des intrigues palpitantes et générer un personnage principal au style soigné directement sur votre smartphone.
                  </p>
                </div>

                {/* Module 2 */}
                <div className="animated-pillar-row-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-purple">
                      <span className="floating-emoji">🎭</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-purple">Module 2 • Le Secret Clé</span>
                      <h4 className="pillar-main-title">Garder le Même Visage sur Toutes Vos Images</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    La technique secrète pour que vos héros conservent exactement les mêmes traits, la même coiffure et le même style d'une scène à l'autre sans jamais se déformer.
                  </p>
                </div>

                {/* Module 3 */}
                <div className="animated-pillar-row-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-emerald">
                      <span className="floating-emoji">💬</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-emerald">Module 3</span>
                      <h4 className="pillar-main-title">Bulles de BD & Dialogues sur Mobile</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Comment placer des bulles professionnelles, des textes parfaitement lisibles et des répliques percutantes directement depuis votre téléphone portable.
                  </p>
                </div>

                {/* Module 4 */}
                <div className="animated-pillar-row-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-orange">
                      <span className="floating-emoji">📈</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-orange">Module 4</span>
                      <h4 className="pillar-main-title">Publication & Croissance d'Abonnés</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Les stratégies pour publier sur Facebook, TikTok et WhatsApp, fidéliser une audience engagée et monétiser vos créations.
                  </p>
                </div>
              </div>

              {/* BARRE DE CONFIANCE : NOTRE ACCOMPAGNEMENT PRIVÉ */}
              <div className="mentorship-trust-card">
                <div className="trust-card-row">
                  <div className="trust-card-icon">
                    <Handshake size={20} />
                  </div>
                  <div className="trust-card-body">
                    <strong>Notre Accompagnement Privé Inclus :</strong>
                    <p>
                      Nous vous accompagnons personnellement pas-à-pas sur WhatsApp pour vous aider à choisir votre thématique et valider vos premières créations.
                    </p>
                    <div className="trust-services-subrow">
                      <span>Besoin d'un compte monétisable (Facebook, TikTok ou YouTube) prêt à l'emploi ?</span>{' '}
                      <button 
                        type="button" 
                        className="services-link-btn"
                        onClick={() => {
                          analyticsService.trackButtonClick('btn_services_bd', 'services', '#formations');
                          onGoToServices();
                        }}
                      >
                        « Découvrez Nos Services » →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOUTON D'ACTION DÉBLOQUER */}
              <div className="page-bottom-actions">
                {isBDUnlocked ? (
                  <button 
                    className="btn-unlock-formation-card book-unlocked-btn"
                    onClick={() => onUnlockBook({ ...bookBD, price: baseBdPrice })}
                  >
                    <div className="btn-unlock-card-body">
                      <div className="btn-unlock-headline">
                        <CheckCircle2 size={16} className="unlocked-icon-check" />
                        <span className="btn-unlock-title">Formation Débloquée • Ouvrir</span>
                        <ArrowRight size={14} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        <span className="btn-unlock-hint">Accéder immédiatement au contenu</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button 
                    className={`btn-unlock-formation-card ${bdReductionPct > 0 ? 'card-has-promo' : ''}`}
                    onClick={() => onUnlockBook({ ...bookBD, price: finalBdPrice, originalPrice: origBdPrice })}
                  >
                    <div className="btn-unlock-card-body">
                      <div className="btn-unlock-headline">
                        <Sparkles size={16} className="btn-unlock-sparkle" />
                        <span className="btn-unlock-title">Débloquer cette formation</span>
                        <ArrowRight size={15} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        <div className="btn-unlock-price-tags">
                          <span className="btn-price-struck">{bdPair.originalFormatted}</span>
                          <span className="btn-price-discounted">{bdPair.currentFormatted}</span>
                          {bdReductionPct > 0 ? (
                            <span className="btn-promo-tag">-{bdReductionPct}% PROMO</span>
                          ) : (
                            <span className="btn-price-subhint">• Accès à vie</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Bouton pour basculer vers la 2ème formation */}
                <button 
                  type="button" 
                  className="btn-switch-other-formation"
                  onClick={() => {
                    analyticsService.trackButtonClick('btn_switch_video', 'livre-bd-storytelling', '#formations');
                    setMobileActiveTab('video');
                    const rightPage = document.querySelector('.right-page');
                    if (rightPage) rightPage.scrollTop = 0;
                  }}
                  title="Voir la formation Vidéos avec l'IA"
                >
                  <span>Voir la 2ème formation : Vidéos avec l'IA</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================================
              PAGE DE DROITE : FORMATION 2 (VIDÉOS AVEC L'IA)
              ==================================================================== */}
          <div className={`book-page right-page ${mobileActiveTab === 'video' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="page-inner-content page-fade-in">
              {/* LIVRE 3D EN HAUT : CLIC SUR LE LIVRE OU LE BADGE OUVRE/DÉBLOQUE */}
              <div className="book-floating-hero">
                <div className="book-halo-glow video-halo" aria-hidden="true"></div>
                <img 
                  src="/books/book_video_cover.png?v=2" 
                  alt="Livre Vidéos Virales IA" 
                  className="book-rotating-3d video-book-rotating clickable-book-cover"
                  onClick={() => onUnlockBook({ ...bookVideo, price: isVideoUnlocked ? baseVideoPrice : finalVideoPrice, originalPrice: origVideoPrice })}
                  style={{ cursor: 'pointer' }}
                  title={isVideoUnlocked ? "Cliquer pour ouvrir la formation débloquée" : "Cliquer pour débloquer cette formation"}
                />
                
                {/* Badge de prix cliquable sous le livre */}
                <div 
                  className={`book-price-badge-animated video-badge-animated ${isVideoUnlocked ? 'is-unlocked' : ''}`}
                  onClick={() => onUnlockBook({ ...bookVideo, price: isVideoUnlocked ? baseVideoPrice : finalVideoPrice, originalPrice: origVideoPrice })}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  title={isVideoUnlocked ? "Cliquer pour ouvrir la formation débloquée" : "Cliquer pour débloquer cette formation"}
                >
                  {isVideoUnlocked ? (
                    <span className="price-tag-unlocked">✓ Formation Débloquée</span>
                  ) : (
                    <div className="book-price-strikethrough-wrap">
                      <span className="price-tag-struck">{videoPair.originalFormatted}</span>
                      <span className="price-tag-cyan">{videoPair.currentFormatted}</span>
                      {videoReductionPct > 0 && (
                        <span className="badge-promo-chip video-chip">-{videoReductionPct}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Titre & Accroche claire */}
              <div className="formation-intro-block">
                <h2 className="formation-book-title">
                  Création de Vidéos Virales avec l'IA
                </h2>
                <p className="formation-catchy-lead">
                  Transformez de simples images fixes en vidéos animées dynamiques et captivez votre public sur TikTok et Reels.
                </p>

                {/* Badges Clés avec Émojis Rebondissants */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <span className="floating-emoji">📱</span>
                    <span>Montage sur Smartphone</span>
                  </div>
                  <div className="key-pill pill-free">
                    <span className="floating-emoji">🆓</span>
                    <span>Animation IA Gratuite</span>
                  </div>
                </div>
              </div>

              {/* CARTE D'APERÇU ANIMÉE UNIQUE EN HAUT */}
              <div 
                className="formation-top-teaser-card video-teaser-theme"
                onClick={() => {
                  analyticsService.trackButtonClick('teaser_card_click_video', 'livre-videos-ia', '#formations');
                  setLightbox({ type: 'video', index: 0 });
                }}
                role="button"
                tabIndex={0}
                title="Cliquer pour regarder l'extrait vidéo"
              >
                <div className="teaser-card-media-wrap">
                  <video 
                    ref={teaserVideoRef}
                    src="/images/formation/video-exemple/sante.mp4" 
                    muted 
                    playsInline 
                    loop 
                    autoPlay 
                    preload="metadata"
                    className="teaser-card-img"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="teaser-card-glow-pulse video-pulse" aria-hidden="true"></div>
                  <div className="teaser-card-overlay">
                    <span className="teaser-simple-tag video-tag">Extrait</span>
                    <div className="teaser-cta-pill video-cta">
                      <span>Regarder</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LES 4 MODULES ANIMÉS GROUPÉS EN BAS */}
              <div className="formation-vertical-cards-stack video-flow-theme">
                {/* Module 1 */}
                <div className="animated-pillar-row-card video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-sky">
                      <span className="floating-emoji">🎬</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-sky">Module 1</span>
                      <h4 className="pillar-main-title">Scénarisation & Découpage Visuel</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Comment découper une histoire en séquences courtes et percutantes de 10 à 30 secondes pour captiver dès les premières secondes.
                  </p>
                </div>

                {/* Module 2 */}
                <div className="animated-pillar-row-card video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-cyan">
                      <span className="floating-emoji">⚡</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-cyan">Module 2 • Magie de l'IA</span>
                      <h4 className="pillar-main-title">Animer les Personnages & les Mouvements</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    La méthode pour transformer une image fixe en vidéo animée : faire bouger les regards, les expressions et les décors avec l'IA gratuitement.
                  </p>
                </div>

                {/* Module 3 */}
                <div className="animated-pillar-row-card video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-violet">
                      <span className="floating-emoji">📱</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-violet">Module 3</span>
                      <h4 className="pillar-main-title">Assemblage & Conversations sur Mobile</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Fusionnez vos clips animés en quelques clics sur votre smartphone, intégrez les dialogues et finalisez vos vidéos sans logiciel lourd.
                  </p>
                </div>

                {/* Module 4 */}
                <div className="animated-pillar-row-card video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-blue">
                      <span className="floating-emoji">🔥</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-blue">Module 4</span>
                      <h4 className="pillar-main-title">Publication & Viralité des Formats Courts</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Les techniques pour poster efficacement, attirer l'algorithme TikTok, Reels et Shorts et faire grimper rapidement votre audience.
                  </p>
                </div>
              </div>

              {/* BARRE DE CONFIANCE : NOTRE ACCOMPAGNEMENT PRIVÉ */}
              <div className="mentorship-trust-card video-trust-card">
                <div className="trust-card-row">
                  <div className="trust-card-icon video-trust-icon">
                    <Handshake size={20} />
                  </div>
                  <div className="trust-card-body">
                    <strong>Notre Accompagnement Privé Inclus :</strong>
                    <p>
                      Nous vous accompagnons personnellement pas-à-pas sur WhatsApp pour vous aider à choisir votre thématique et valider vos premières vidéos animées.
                    </p>
                    <div className="trust-services-subrow">
                      <span>Besoin d'un compte monétisable (Facebook, TikTok ou YouTube) prêt à l'emploi ?</span>{' '}
                      <button 
                        type="button" 
                        className="services-link-btn"
                        onClick={() => {
                          analyticsService.trackButtonClick('btn_services_video', 'services', '#formations');
                          onGoToServices();
                        }}
                      >
                        « Découvrez Nos Services » →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOUTON D'ACTION DÉBLOQUER */}
              <div className="page-bottom-actions">
                {isVideoUnlocked ? (
                  <button 
                    className="btn-unlock-formation-card video-card-btn book-unlocked-btn"
                    onClick={() => onUnlockBook({ ...bookVideo, price: baseVideoPrice })}
                  >
                    <div className="btn-unlock-card-body">
                      <div className="btn-unlock-headline">
                        <CheckCircle2 size={16} className="unlocked-icon-check" />
                        <span className="btn-unlock-title">Formation Débloquée • Ouvrir</span>
                        <ArrowRight size={14} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        <span className="btn-unlock-hint">Accéder immédiatement au contenu</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button 
                    className={`btn-unlock-formation-card video-card-btn ${videoReductionPct > 0 ? 'card-has-promo' : ''}`}
                    onClick={() => onUnlockBook({ ...bookVideo, price: finalVideoPrice, originalPrice: origVideoPrice })}
                  >
                    <div className="btn-unlock-card-body">
                      <div className="btn-unlock-headline">
                        <Sparkles size={16} className="btn-unlock-sparkle" />
                        <span className="btn-unlock-title">Débloquer cette formation</span>
                        <ArrowRight size={15} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        <div className="btn-unlock-price-tags">
                          <span className="btn-price-struck">{videoPair.originalFormatted}</span>
                          <span className="btn-price-discounted">{videoPair.currentFormatted}</span>
                          {videoReductionPct > 0 ? (
                            <span className="btn-promo-tag">-{videoReductionPct}% PROMO</span>
                          ) : (
                            <span className="btn-price-subhint">• Accès à vie</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Bouton pour revenir à la 1ère formation */}
                <button 
                  type="button" 
                  className="btn-switch-other-formation"
                  onClick={() => {
                    analyticsService.trackButtonClick('btn_switch_bd', 'livre-videos-ia', '#formations');
                    setMobileActiveTab('bd');
                    const leftPage = document.querySelector('.left-page');
                    if (leftPage) leftPage.scrollTop = 0;
                  }}
                  title="Voir la formation Bandes dessinées"
                >
                  <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
                  <span>Voir la 1ère formation : Bandes dessinées</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          LIGHTBOX MODAL PLEIN ÉCRAN POUR FEUILLETER LES IMAGES PROPREMENT
          AFFICHE L'IMAGE ENTIÈRE SANS AUCUNE DESCRIPTION, AVEC BOUTON SUIVANT
          ==================================================================== */}
      {lightbox && (
        <div 
          className="formation-lightbox-backdrop" 
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse d'exemples"
        >
          <div 
            className="formation-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre supérieure AU-DESSUS du média avec croix pure sans rond */}
            <div className="lightbox-top-bar">
              <button 
                type="button"
                className="lightbox-pure-close"
                onClick={() => setLightbox(null)}
                aria-label="Fermer la vue"
                title="Fermer (Échap)"
              >
                <X size={26} strokeWidth={2.4} />
              </button>
            </div>

            {/* Zone d'affichage : Image ou Vidéo toute entière, prend bien toute la largeur gauche/droite */}
            <div className="lightbox-pure-viewport">
              {lightbox.type === 'video' ? (
                <video 
                  src={VIDEO_GALLERY[lightbox.index].video}
                  controls 
                  autoPlay 
                  playsInline 
                  preload="auto"
                  className="lightbox-pure-media"
                />
              ) : (
                <img 
                  src={BD_GALLERY[lightbox.index].img}
                  alt={`Scène ${lightbox.index + 1}`}
                  className="lightbox-pure-media"
                />
              )}
            </div>

            {/* Flèches de navigation sobres & professionnelles (si plusieurs éléments) */}
            {(lightbox.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY).length > 1 && (
              <>
                <button 
                  type="button"
                  className="lightbox-pure-nav-btn prev-arrow"
                  onClick={handlePrevSlide}
                  aria-label="Précédent"
                  title="Précédent"
                >
                  <ChevronLeft size={22} strokeWidth={2.4} />
                </button>

                <button 
                  type="button"
                  className="lightbox-pure-nav-btn next-arrow"
                  onClick={handleNextSlide}
                  aria-label="Suivant"
                  title="Suivant"
                >
                  <ChevronRight size={22} strokeWidth={2.4} />
                </button>

                {/* Petits points discrets en bas */}
                <div className="lightbox-pure-dots">
                  {(lightbox.type === 'bd' ? BD_GALLERY : VIDEO_GALLERY).map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`lightbox-pure-dot ${idx === lightbox.index ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox((prev) => ({ ...prev, index: idx }));
                      }}
                      aria-label={`Aller à la scène ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormationsBookView;


