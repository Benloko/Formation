import React, { useState, useEffect } from 'react';
import { BOOKS_DATA } from '../data/booksData';
import { storageService } from '../services/storageService';
import { analyticsService } from '../services/analyticsService';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Gift, 
  Crown, 
  Eye, 
  Play, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Film, 
  Palette, 
  Lightbulb,
  Layers,
  Flame
} from 'lucide-react';
import { currencyService } from '../services/currencyService';
import './FormationsBookView.css';

// Les 3 épisodes réels pour la formation BD (Même personnage : Amina & Koffi)
const BD_STORY_SCENES = [
  {
    id: 1,
    tag: 'Épisode 1',
    emoji: '🌧️',
    title: 'L\'Arrivée Nocturne sous la Pluie',
    desc: 'Amina arrive trempée dans la nuit, tenant fermement une mystérieuse enveloppe jaune. Observez la netteté et la gestion de la lumière générée sur téléphone portable.',
    img: '/images/formation/scene-1-la-porte.jpg',
  },
  {
    id: 2,
    tag: 'Épisode 2',
    emoji: '✉️',
    title: 'La Remise de la Lettre Mystérieuse',
    desc: 'Même visage, mêmes tresses, mêmes traits pour Amina et Koffi. Vous apprenez la formule secrète pour maintenir 100% de ressemblance d\'une image à l\'autre.',
    img: '/images/formation/scene-2-la-remise.jpg',
  },
  {
    id: 3,
    tag: 'Épisode 3',
    emoji: '😱',
    title: 'La Révélation Choc & le Suspense',
    desc: 'Le choc et les larmes lors de la lecture de la lettre. Le genre d\'émotion dramatique qui rend votre communauté passionnée et impatiente de voir la suite.',
    img: '/images/formation/scene-3-la-revelation.jpg',
  },
];

// Les 3 scènes animées réelles pour la formation Vidéo avec IA (Ariel & sa voisine)
const VIDEO_STORY_SCENES = [
  {
    id: 1,
    tag: 'Scène 1',
    emoji: '🚪',
    title: 'La Rencontre à la Porte de Nuit',
    desc: 'Création du premier plan dramatique sur mobile : regards intenses, coiffure tressée et atmosphère nocturne ultra-détaillée.',
    img: '/images/formation/ariel-voisine-scene-1.jpg',
  },
  {
    id: 2,
    tag: 'Scène 2',
    emoji: '💬',
    title: 'Animation des Regards & Sourires par l\'IA',
    desc: 'Mêmes visages conservés à 100% : l\'IA anime les mouvements de tête, les regards et les sourires de façon naturelle et fluide.',
    img: '/images/formation/ariel-voisine-scene-2.jpg',
  },
  {
    id: 3,
    tag: 'Scène 3',
    emoji: '⚡',
    title: 'Tension Dramatique & Rendu Viral TikTok',
    desc: 'Ajout de la voix off, des bruitages et du suspense pour créer un feuilleton vidéo prêt à faire exploser les vues sur TikTok et Reels.',
    img: '/images/formation/ariel-voisine-scene-3.jpg',
  },
];

export function FormationsBookView({ onClose, onUnlockBook, onGoToServices, activePromo: propActivePromo }) {
  const [mobileActiveTab, setMobileActiveTab] = useState('bd'); // 'bd' | 'video'
  const [activeBdScene, setActiveBdScene] = useState(0);
  const [activeVideoScene, setActiveVideoScene] = useState(0);
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());
  const [originalPrices, setOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [, setCurrentCountry] = useState(() => currencyService.getCurrentCountry());
  const [previewModal, setPreviewModal] = useState(null);

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

  const bookBD = BOOKS_DATA.find((b) => b.id === 'livre-bd-storytelling') || BOOKS_DATA[0];
  const bookVideo = BOOKS_DATA.find((b) => b.id === 'livre-videos-ia') || BOOKS_DATA[1];

  const isBDUnlocked = storageService.isBookUnlocked(bookBD.id);
  const isVideoUnlocked = storageService.isBookUnlocked(bookVideo.id);

  // Calcul des prix avec code promo
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

  const currentBdScene = BD_STORY_SCENES[activeBdScene];
  const currentVideoScene = VIDEO_STORY_SCENES[activeVideoScene];

  return (
    <div className="formations-book-viewport">
      {/* MODAL LIGHTBOX HD POUR INSPECTER UNE IMAGE EN GRAND */}
      {previewModal && (
        <div className="formation-result-modal-backdrop" onClick={() => setPreviewModal(null)}>
          <div className="formation-result-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="formation-result-modal-close" 
              onClick={() => setPreviewModal(null)}
              aria-label="Fermer l'aperçu"
            >
              <X size={20} />
            </button>
            
            <div className="formation-result-modal-header">
              <span className="result-modal-pill">
                {previewModal.tag}
              </span>
              <h3 className="result-modal-title">
                {previewModal.title}
              </h3>
              <p className="result-modal-subtitle">
                {previewModal.desc}
              </p>
            </div>

            <div className="formation-result-modal-body">
              <div className="result-modal-image-wrapper">
                <img 
                  src={previewModal.img} 
                  alt={previewModal.title} 
                  className="result-modal-preview-img"
                />
                <div className="result-modal-caption">
                  <span>✨ 100% créé sur smartphone avec des outils d'IA 100% gratuits</span>
                </div>
              </div>
            </div>

            <div className="formation-result-modal-footer">
              <button 
                type="button" 
                className="btn-modal-action-unlock"
                onClick={() => {
                  setPreviewModal(null);
                  onUnlockBook({ 
                    ...previewModal.book, 
                    price: previewModal.price, 
                    originalPrice: previewModal.origPrice 
                  });
                }}
              >
                <Sparkles size={16} />
                <span>Je veux apprendre à créer ces histoires !</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
              {/* En-tête de la page */}
              <div className="page-header-row">
                <span className="page-category-tag">🎨 Bandes dessinées & IA</span>
                {bdReductionPct > 0 && !isBDUnlocked && (
                  <span className="promo-applied-chip">
                    ✨ Code <strong>{activePromo.code}</strong> actif (-{bdReductionPct}%)
                  </span>
                )}
              </div>

              {/* LIVRE 3D EN HAUT SEUL : TOURNANT DOUCEMENT EN ROND AVEC HALO LUMINEUX */}
              <div className="book-floating-hero">
                <div className="book-halo-glow" aria-hidden="true"></div>
                <img 
                  src="/books/book_bd_cover.png" 
                  alt="Livre BD & Storytelling Mr Ben" 
                  className="book-rotating-3d"
                />
                
                {/* Badge de prix barré animé sous le livre */}
                <div className={`book-price-badge-animated ${isBDUnlocked ? 'is-unlocked' : ''}`}>
                  {isBDUnlocked ? (
                    <span className="price-tag-gold">✓ Formation Débloquée</span>
                  ) : bdReductionPct > 0 ? (
                    <div className="promo-badge-prices">
                      <span className="promo-old-price">{baseBdPrice.toLocaleString()} F</span>
                      <span className="price-tag-gold">{finalBdPrice.toLocaleString()} FCFA</span>
                      <span className="badge-highlight-pill">-{bdReductionPct}%</span>
                    </div>
                  ) : (
                    <div className="book-price-strikethrough-wrap">
                      <span className="price-tag-struck">{bdPair.originalFormatted}</span>
                      <span className="price-tag-gold">{bdPair.currentFormatted}</span>
                      <span className="badge-highlight-pill">Best-Seller</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Titre & Accroche vibrante */}
              <div className="formation-intro-block">
                <h2 className="formation-book-title">
                  L'Art du Storytelling & Bandes Dessinées
                </h2>
                <p className="formation-catchy-lead">
                  Créez des feuilletons captivants et bâtissez une armée d'abonnés fidèles sans dépenser 1 centime.
                </p>

                {/* 3 Badges Clés avec Émojis Rebondissants */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <span className="floating-emoji">📱</span>
                    <span>100% sur Smartphone</span>
                  </div>
                  <div className="key-pill pill-free">
                    <span className="floating-emoji">🆓</span>
                    <span>Outils IA 100% Gratuits</span>
                  </div>
                  <div className="key-pill pill-mentorship">
                    <span className="floating-emoji">👑</span>
                    <span>Mentorat Privé Mr Ben</span>
                  </div>
                </div>
              </div>

              {/* 4 CARTES DÉTAILLÉES : UNE CARTE PAR LIGNE AVEC ANIMATION FLEXIBLE */}
              <div className="formation-vertical-cards-stack">
                {/* Carte 1 */}
                <div className="animated-pillar-row-card card-delay-1">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-amber">
                      <span className="floating-emoji">💡</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge">Module 1</span>
                      <h4 className="pillar-main-title">Trouver des Scénarios qui Rendent Accro</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    La méthode simple pour imaginer en 5 minutes une intrigue africaine à rebondissements avec du suspense, des secrets de famille et des retournements que votre audience ne voudra plus lâcher.
                  </p>
                </div>

                {/* Carte 2 */}
                <div className="animated-pillar-row-card card-delay-2">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-purple">
                      <span className="floating-emoji">🎭</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-purple">Module 2 • Le Secret Clé</span>
                      <h4 className="pillar-main-title">Garder le Même Visage sur Toutes les Images</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    La formule secrète pour que vos personnages conservent <strong>exactement les mêmes traits, la même coiffure et les mêmes vêtements</strong> de la première à la dernière case de votre histoire.
                  </p>
                </div>

                {/* Carte 3 */}
                <div className="animated-pillar-row-card card-delay-3">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-emerald">
                      <span className="floating-emoji">💬</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-emerald">Module 3</span>
                      <h4 className="pillar-main-title">Bulles de BD & Dialogues Émotionnels sur Mobile</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Insérez des bulles de BD professionnelles, des textes lisibles et des onomatopées percutantes directement depuis votre smartphone, sans aucun ordinateur ni logiciel payant.
                  </p>
                </div>

                {/* Carte 4 */}
                <div className="animated-pillar-row-card card-delay-4">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-orange">
                      <span className="floating-emoji">📈</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-orange">Module 4</span>
                      <h4 className="pillar-main-title">Publication, Explosion d'Abonnés & Monétisation</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Les meilleures heures pour poster sur Facebook, TikTok et WhatsApp, les astuces d'accroche pour rendre vos épisodes viraux et comment transformer vos fans en opportunités concrètes.
                  </p>
                </div>
              </div>

              {/* DÉMONSTRATION RÉELLE : 3 IMAGES COHÉRENTES DU MÊME FEUILLETON */}
              <div className="episodes-showcase-container">
                <div className="showcase-top-header">
                  <div className="showcase-title-group">
                    <span className="showcase-mini-pill">
                      <span className="floating-emoji">📖</span> Démonstration Réelle
                    </span>
                    <h3 className="showcase-heading">Le Feuilleton en 3 Épisodes (Même Visage)</h3>
                    <p className="showcase-sub">
                      Voici un aperçu d'une histoire créée avec cette méthode. Observez la cohérence parfaite d'Amina et Koffi d'une scène à l'autre !
                    </p>
                  </div>
                </div>

                {/* Onglets des 3 épisodes */}
                <div className="episode-tabs-selector">
                  {BD_STORY_SCENES.map((scene, idx) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`episode-tab-btn ${activeBdScene === idx ? 'active-tab' : ''}`}
                      onClick={() => {
                        analyticsService.trackButtonClick(`tab_bd_scene_${idx + 1}`, 'livre-bd-storytelling', '#formations');
                        setActiveBdScene(idx);
                      }}
                    >
                      <span className="tab-emoji">{scene.emoji}</span>
                      <span className="tab-label">{scene.tag}</span>
                    </button>
                  ))}
                </div>

                {/* Carte d'affichage de la scène active avec zoom */}
                <div 
                  className="active-scene-card"
                  onClick={() => {
                    analyticsService.trackButtonClick(`zoom_bd_scene_${activeBdScene + 1}`, 'livre-bd-storytelling', '#formations');
                    setPreviewModal({
                      tag: `🎨 ${currentBdScene.tag} • Feuilleton Amina & Koffi`,
                      title: currentBdScene.title,
                      desc: currentBdScene.desc,
                      img: currentBdScene.img,
                      book: bookBD,
                      price: finalBdPrice,
                      origPrice: origBdPrice
                    });
                  }}
                  title="Cliquer pour admirer en plein écran"
                >
                  <div className="scene-image-frame">
                    <img 
                      src={currentBdScene.img} 
                      alt={currentBdScene.title} 
                      className="scene-main-img"
                    />
                    <div className="scene-zoom-overlay">
                      <Eye size={20} />
                      <span>Cliquer pour agrandir en HD</span>
                    </div>
                    <span className="scene-overlay-badge">
                      {currentBdScene.emoji} {currentBdScene.tag}
                    </span>
                  </div>

                  <div className="scene-card-caption">
                    <h5 className="scene-caption-title">{currentBdScene.title}</h5>
                    <p className="scene-caption-desc">{currentBdScene.desc}</p>
                  </div>
                </div>

                {/* Ruban des 3 miniatures pour voir la cohérence d'un coup d'œil */}
                <div className="storyboard-ribbon-thumbs">
                  {BD_STORY_SCENES.map((sc, idx) => (
                    <div 
                      key={sc.id} 
                      className={`ribbon-thumb-item ${activeBdScene === idx ? 'thumb-active' : ''}`}
                      onClick={() => setActiveBdScene(idx)}
                    >
                      <img src={sc.img} alt={sc.title} className="ribbon-thumb-img" />
                      <span className="ribbon-thumb-tag">{sc.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BARRE DE CONFIANCE : MENTORAT PRIVÉ & COMPTES MONÉTISABLES */}
              <div className="mentorship-trust-card">
                <div className="trust-card-row">
                  <div className="trust-card-icon">
                    <Crown size={18} />
                  </div>
                  <div className="trust-card-body">
                    <strong>Accompagnement Privé Mr Ben Inclus :</strong>
                    <p>
                      Vous n'avez plus à vous soucier de quelle thématique choisir. Mr Ben vous assiste directement sur WhatsApp pour définir votre niche et valider vos premiers épisodes.
                    </p>
                    <div className="trust-services-subrow">
                      <span>Besoin d'un compte monétisable (TikTok/Facebook/YouTube) prêt à l'emploi ?</span>{' '}
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

              {/* BOUTON D'ACTION DÉBLOQUER (AVEC EFFET DE BRILLANCE ET PRIX) */}
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
                        {bdReductionPct > 0 ? (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-discounted">{finalBdPrice.toLocaleString()} FCFA</span>
                            <span className="btn-price-struck">{baseBdPrice.toLocaleString()} FCFA</span>
                            <span className="btn-promo-tag">-{bdReductionPct}% PROMO</span>
                          </div>
                        ) : (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-struck">{bdPair.originalFormatted}</span>
                            <span className="btn-price-single">{bdPair.currentFormatted} • Accès à vie</span>
                          </div>
                        )}
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
              PAGE DE DROITE : FORMATION 2 (VIDÉO AVEC IA)
              ==================================================================== */}
          <div className={`book-page right-page ${mobileActiveTab === 'video' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="page-inner-content page-fade-in">
              {/* En-tête de la page */}
              <div className="page-header-row">
                <span className="page-category-tag video-tag">🎬 Vidéos avec l'IA</span>
                {videoReductionPct > 0 && !isVideoUnlocked && (
                  <span className="promo-applied-chip video-chip">
                    ✨ Code <strong>{activePromo.code}</strong> actif (-{videoReductionPct}%)
                  </span>
                )}
              </div>

              {/* LIVRE 3D EN HAUT SEUL : TOURNANT DOUCEMENT AVEC HALO BLEU/CYAN */}
              <div className="book-floating-hero">
                <div className="book-halo-glow video-halo" aria-hidden="true"></div>
                <img 
                  src="/books/book_video_cover.png?v=2" 
                  alt="Livre Vidéos Virales IA Mr Ben" 
                  className="book-rotating-3d video-book-rotating"
                />
                
                {/* Badge de prix barré animé sous le livre */}
                <div className={`book-price-badge-animated video-badge-animated ${isVideoUnlocked ? 'is-unlocked' : ''}`}>
                  {isVideoUnlocked ? (
                    <span className="price-tag-gold">✓ Formation Débloquée</span>
                  ) : videoReductionPct > 0 ? (
                    <div className="promo-badge-prices">
                      <span className="promo-old-price video-old">{baseVideoPrice.toLocaleString()} F</span>
                      <span className="price-tag-cyan">{finalVideoPrice.toLocaleString()} FCFA</span>
                      <span className="badge-highlight-pill video-pill">-{videoReductionPct}%</span>
                    </div>
                  ) : (
                    <div className="book-price-strikethrough-wrap">
                      <span className="price-tag-struck">{videoPair.originalFormatted}</span>
                      <span className="price-tag-cyan">{videoPair.currentFormatted}</span>
                      <span className="badge-highlight-pill video-pill">Tendance 2026</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Titre & Accroche vibrante */}
              <div className="formation-intro-block">
                <h2 className="formation-book-title">
                  Création de Vidéos Virales avec l'IA
                </h2>
                <p className="formation-catchy-lead">
                  Animez vos personnages, ajoutez voix et musique et faites exploser vos vues TikTok & Reels.
                </p>

                {/* 3 Badges Clés avec Émojis Rebondissants */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <span className="floating-emoji">📱</span>
                    <span>Montage sur Smartphone</span>
                  </div>
                  <div className="key-pill pill-free">
                    <span className="floating-emoji">🆓</span>
                    <span>Animation IA Gratuite</span>
                  </div>
                  <div className="key-pill pill-trending">
                    <span className="floating-emoji">🔥</span>
                    <span>Format Viral TikTok/Reels</span>
                  </div>
                </div>
              </div>

              {/* 4 CARTES DÉTAILLÉES : UNE CARTE PAR LIGNE AVEC ANIMATION FLEXIBLE */}
              <div className="formation-vertical-cards-stack">
                {/* Carte 1 */}
                <div className="animated-pillar-row-card card-delay-1 video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-sky">
                      <span className="floating-emoji">🎬</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-sky">Module 1</span>
                      <h4 className="pillar-main-title">Scénariser des Vidéos Courtes & Rythmées</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Comment découper une histoire en mini-clips dynamiques de 10 à 30 secondes calibrés pour scotcher le spectateur dès les 3 premières secondes et booster la rétention.
                  </p>
                </div>

                {/* Carte 2 */}
                <div className="animated-pillar-row-card card-delay-2 video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-cyan">
                      <span className="floating-emoji">⚡</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-cyan">Module 2 • Magie de l'IA</span>
                      <h4 className="pillar-main-title">Animer Images Fixes en Vidéos Vivantes</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Donnez vie aux personnages, faites cligner les yeux, tourner les têtes, pleurer et animer les décors sans aucun abonnement payant et directement depuis votre téléphone.
                  </p>
                </div>

                {/* Carte 3 */}
                <div className="animated-pillar-row-card card-delay-3 video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-violet">
                      <span className="floating-emoji">🎧</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-violet">Module 3</span>
                      <h4 className="pillar-main-title">Voix Off Réaliste, Sons & Signature de Chaîne</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Générez une voix off envoûtante avec l'IA, ajoutez des musiques d'ambiance à suspense et apposez votre logo/signature pour protéger vos vidéos contre le vol.
                  </p>
                </div>

                {/* Carte 4 */}
                <div className="animated-pillar-row-card card-delay-4 video-theme-card">
                  <div className="pillar-card-header">
                    <div className="pillar-icon-box box-blue">
                      <span className="floating-emoji">🔥</span>
                    </div>
                    <div className="pillar-title-wrap">
                      <span className="pillar-step-badge badge-blue">Module 4</span>
                      <h4 className="pillar-main-title">Dompter l'Algorithme & Dépasser 100K Vues</h4>
                    </div>
                  </div>
                  <p className="pillar-detail-text">
                    Les secrets d'accroches virales, les hashtags tendance et la stratégie de programmation pour percer sur TikTok, Instagram Reels et YouTube Shorts.
                  </p>
                </div>
              </div>

              {/* DÉMONSTRATION RÉELLE : 3 SCÈNES ANIMÉES DU FEUILLETON VIDÉO */}
              <div className="episodes-showcase-container video-showcase-container">
                <div className="showcase-top-header">
                  <div className="showcase-title-group">
                    <span className="showcase-mini-pill pill-video">
                      <span className="floating-emoji">🎬</span> Démonstration Réelle Vidéo
                    </span>
                    <h3 className="showcase-heading">Le Feuilleton Animé en 3 Scènes</h3>
                    <p className="showcase-sub">
                      Mêmes visages conservés du début à la fin ! Observez comment l'animation et l'expression donnent vie à cette intrigue nocturne.
                    </p>
                  </div>
                </div>

                {/* Onglets des 3 scènes */}
                <div className="episode-tabs-selector video-tabs">
                  {VIDEO_STORY_SCENES.map((scene, idx) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`episode-tab-btn video-tab-btn ${activeVideoScene === idx ? 'active-tab' : ''}`}
                      onClick={() => {
                        analyticsService.trackButtonClick(`tab_video_scene_${idx + 1}`, 'livre-videos-ia', '#formations');
                        setActiveVideoScene(idx);
                      }}
                    >
                      <span className="tab-emoji">{scene.emoji}</span>
                      <span className="tab-label">{scene.tag}</span>
                    </button>
                  ))}
                </div>

                {/* Carte d'affichage de la scène active avec zoom */}
                <div 
                  className="active-scene-card video-active-card"
                  onClick={() => {
                    analyticsService.trackButtonClick(`zoom_video_scene_${activeVideoScene + 1}`, 'livre-videos-ia', '#formations');
                    setPreviewModal({
                      tag: `🎬 ${currentVideoScene.tag} • Feuilleton Vidéo Animé`,
                      title: currentVideoScene.title,
                      desc: currentVideoScene.desc,
                      img: currentVideoScene.img,
                      book: bookVideo,
                      price: finalVideoPrice,
                      origPrice: origVideoPrice
                    });
                  }}
                  title="Cliquer pour admirer en plein écran"
                >
                  <div className="scene-image-frame">
                    <img 
                      src={currentVideoScene.img} 
                      alt={currentVideoScene.title} 
                      className="scene-main-img"
                    />
                    <div className="scene-zoom-overlay">
                      <Play size={22} fill="#ffffff" />
                      <span>Cliquer pour voir les détails HD</span>
                    </div>
                    <span className="scene-overlay-badge video-badge">
                      {currentVideoScene.emoji} {currentVideoScene.tag}
                    </span>
                  </div>

                  <div className="scene-card-caption">
                    <h5 className="scene-caption-title">{currentVideoScene.title}</h5>
                    <p className="scene-caption-desc">{currentVideoScene.desc}</p>
                  </div>
                </div>

                {/* Ruban des 3 miniatures pour voir la cohérence d'un coup d'œil */}
                <div className="storyboard-ribbon-thumbs">
                  {VIDEO_STORY_SCENES.map((sc, idx) => (
                    <div 
                      key={sc.id} 
                      className={`ribbon-thumb-item ${activeVideoScene === idx ? 'thumb-active video-thumb-active' : ''}`}
                      onClick={() => setActiveVideoScene(idx)}
                    >
                      <img src={sc.img} alt={sc.title} className="ribbon-thumb-img" />
                      <span className="ribbon-thumb-tag">{sc.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BARRE DE CONFIANCE : MENTORAT PRIVÉ & COMPTES MONÉTISABLES */}
              <div className="mentorship-trust-card video-trust-card">
                <div className="trust-card-row">
                  <div className="trust-card-icon video-trust-icon">
                    <Crown size={18} />
                  </div>
                  <div className="trust-card-body">
                    <strong>Accompagnement Privé Mr Ben Inclus :</strong>
                    <p>
                      Vous n'avez plus à vous soucier de quelle thématique choisir. Mr Ben vous assiste directement sur WhatsApp pour définir votre niche et valider vos premières vidéos animées.
                    </p>
                    <div className="trust-services-subrow">
                      <span>Besoin d'un compte monétisable (TikTok/Facebook/YouTube) prêt à l'emploi ?</span>{' '}
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

              {/* BOUTON D'ACTION DÉBLOQUER (AVEC EFFET DE BRILLANCE ET PRIX) */}
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
                        {videoReductionPct > 0 ? (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-discounted">{finalVideoPrice.toLocaleString()} FCFA</span>
                            <span className="btn-price-struck">{baseVideoPrice.toLocaleString()} FCFA</span>
                            <span className="btn-promo-tag">-{videoReductionPct}% PROMO</span>
                          </div>
                        ) : (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-struck">{videoPair.originalFormatted}</span>
                            <span className="btn-price-single">{videoPair.currentFormatted} • Accès à vie</span>
                          </div>
                        )}
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
    </div>
  );
}

export default FormationsBookView;


