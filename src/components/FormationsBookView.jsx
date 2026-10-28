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
  Eye, 
  Play, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Film, 
  Palette, 
  Lightbulb,
  Handshake
} from 'lucide-react';
import { currencyService } from '../services/currencyService';
import './FormationsBookView.css';

export function FormationsBookView({ onClose, onUnlockBook, onGoToServices, activePromo: propActivePromo }) {
  const [mobileActiveTab, setMobileActiveTab] = useState('bd'); // 'bd' | 'video'
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());
  const [originalPrices, setOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [, setCurrentCountry] = useState(() => currencyService.getCurrentCountry());

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

  // Prix et réductions
  const baseBdPrice = prices['livre-bd-storytelling'] || 2500;
  const origBdPrice = originalPrices['livre-bd-storytelling'] || 5000;
  const isBdEligible = activePromo && (!activePromo.targetBookId || activePromo.targetBookId === 'all' || activePromo.targetBookId === bookBD.id);
  const bdReductionPct = isBdEligible ? (activePromo.reductionPct || 0) : 0;
  const finalBdPrice = bdReductionPct > 0 
    ? Math.max(0, Math.round(baseBdPrice * (1 - bdReductionPct / 100))) 
    : baseBdPrice;
  const bdPair = currencyService.formatPricePair(
    finalBdPrice, 
    bdReductionPct > 0 ? baseBdPrice : origBdPrice
  );

  const baseVideoPrice = prices['livre-videos-ia'] || 3100;
  const origVideoPrice = originalPrices['livre-videos-ia'] || 6000;
  const isVideoEligible = activePromo && (!activePromo.targetBookId || activePromo.targetBookId === 'all' || activePromo.targetBookId === bookVideo.id);
  const videoReductionPct = isVideoEligible ? (activePromo.reductionPct || 0) : 0;
  const finalVideoPrice = videoReductionPct > 0 
    ? Math.max(0, Math.round(baseVideoPrice * (1 - videoReductionPct / 100))) 
    : baseVideoPrice;
  const videoPair = currencyService.formatPricePair(
    finalVideoPrice, 
    videoReductionPct > 0 ? baseVideoPrice : origVideoPrice
  );

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
              {/* En-tête de la page */}
              <div className="page-header-row">
                <span className="page-category-tag">🎨 Bandes dessinées & IA</span>
                {bdReductionPct > 0 && !isBDUnlocked && (
                  <span className="promo-applied-chip">
                    ✨ Code <strong>{activePromo.code}</strong> actif (-{bdReductionPct}%)
                  </span>
                )}
              </div>

              {/* LIVRE 3D EN HAUT SEUL : TOURNANT DOUCEMENT AVEC HALO LUMINEUX */}
              <div className="book-floating-hero">
                <div className="book-halo-glow" aria-hidden="true"></div>
                <img 
                  src="/books/book_bd_cover.png" 
                  alt="Livre BD & Storytelling" 
                  className="book-rotating-3d"
                />
                
                {/* Badge de prix barré net sous le livre */}
                <div className={`book-price-badge-animated ${isBDUnlocked ? 'is-unlocked' : ''}`}>
                  {isBDUnlocked ? (
                    <span className="price-tag-gold">✓ Formation Débloquée</span>
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
                  Apprenez à créer vos propres feuilletons illustrés et bâtissez une audience fidèle directement depuis votre smartphone.
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
                    <span className="floating-emoji">🤝</span>
                    <span>Notre Accompagnement Privé</span>
                  </div>
                </div>
              </div>

              {/* PARCOURS DE LA FORMATION : VISUEL ENTIER & CARTE EXPLICATIVE ALTERNÉS */}
              <div className="formation-flow-steps">
                {/* ÉTAPE 1 : Image 1 entière (Création du personnage) -> Carte Module 1 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-illustration-frame">
                    <img 
                      src="/images/formation/scene-1-la-porte.jpg" 
                      alt="Création du personnage sur smartphone" 
                      className="flow-full-clean-img"
                    />
                  </div>
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
                </div>

                {/* ÉTAPE 2 : Image 2 entière avec Bulle de discussion BD n°1 -> Carte Module 2 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-illustration-frame with-speech-bubble">
                    <img 
                      src="/images/formation/scene-2-la-remise.jpg" 
                      alt="Conservation du même visage" 
                      className="flow-full-clean-img"
                    />
                    {/* Bulle de discussion BD élégante & nette */}
                    <div className="comic-speech-bubble bubble-pos-top-right">
                      <span className="bubble-text">« Regarde : mon visage reste 100% identique sur ce nouveau décor ! »</span>
                      <div className="bubble-tail-pointer tail-down" aria-hidden="true"></div>
                    </div>
                  </div>
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
                </div>

                {/* ÉTAPE 3 : Image 3 entière avec Bulle de discussion BD n°2 -> Carte Module 3 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-illustration-frame with-speech-bubble">
                    <img 
                      src="/images/formation/scene-3-la-revelation.jpg" 
                      alt="Rendu final avec dialogues BD" 
                      className="flow-full-clean-img"
                    />
                    {/* Bulle de discussion BD élégante & nette */}
                    <div className="comic-speech-bubble bubble-pos-bottom-left">
                      <span className="bubble-text">« Bulles et dialogues ajoutés facilement sur téléphone, prêts à publier ! »</span>
                      <div className="bubble-tail-pointer tail-top" aria-hidden="true"></div>
                    </div>
                  </div>
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
                </div>

                {/* ÉTAPE 4 : Carte Module 4 (Publication & Croissance) */}
                <div className="flow-step-block">
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
                  alt="Livre Vidéos Virales IA" 
                  className="book-rotating-3d video-book-rotating"
                />
                
                {/* Badge de prix barré net sous le livre */}
                <div className={`book-price-badge-animated video-badge-animated ${isVideoUnlocked ? 'is-unlocked' : ''}`}>
                  {isVideoUnlocked ? (
                    <span className="price-tag-gold">✓ Formation Débloquée</span>
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

              {/* PARCOURS DE LA FORMATION VIDÉO : VISUEL ENTIER & CARTE EXPLICATIVE ALTERNÉS */}
              <div className="formation-flow-steps video-flow-theme">
                {/* ÉTAPE 1 : Aperçu Vidéo 1 entier -> Carte Module 1 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-video-player-frame">
                    <img 
                      src="/images/formation/ariel-voisine-scene-1.jpg" 
                      alt="Cadrage vertical 9:16 pour smartphone" 
                      className="flow-full-clean-img"
                    />
                    <div className="video-player-glow-overlay">
                      <div className="center-play-circle">
                        <Play size={24} fill="#ffffff" stroke="none" className="play-triangle-icon" />
                      </div>
                    </div>
                    <div className="video-timeline-bar" aria-hidden="true">
                      <div className="video-timeline-progress"></div>
                    </div>
                    <div className="video-meta-top-badge">
                      <span>Format 9:16 Mobile</span>
                    </div>
                    <div className="video-duration-pill">
                      <span>0:12</span>
                    </div>
                  </div>
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
                      Comment découper une histoire en séquences courtes et percutantes de 10 à 30 secondes pour maximiser le taux de visionnage.
                    </p>
                  </div>
                </div>

                {/* ÉTAPE 2 : Aperçu Vidéo 2 entier -> Carte Module 2 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-video-player-frame">
                    <img 
                      src="/images/formation/ariel-voisine-scene-2.jpg" 
                      alt="Animation des mouvements et expressions" 
                      className="flow-full-clean-img"
                    />
                    <div className="video-player-glow-overlay">
                      <div className="center-play-circle">
                        <Play size={24} fill="#ffffff" stroke="none" className="play-triangle-icon" />
                      </div>
                    </div>
                    <div className="video-timeline-bar" aria-hidden="true">
                      <div className="video-timeline-progress"></div>
                    </div>
                    <div className="video-meta-top-badge">
                      <span>Format 9:16 Mobile</span>
                    </div>
                    <div className="video-duration-pill">
                      <span>0:18</span>
                    </div>
                  </div>
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
                </div>

                {/* ÉTAPE 3 : Aperçu Vidéo 3 entier -> Carte Module 3 */}
                <div className="flow-step-block">
                  <div className="flow-visual-frame clean-video-player-frame">
                    <img 
                      src="/images/formation/ariel-voisine-scene-3.jpg" 
                      alt="Montage final avec conversations sur téléphone" 
                      className="flow-full-clean-img"
                    />
                    <div className="video-player-glow-overlay">
                      <div className="center-play-circle">
                        <Play size={24} fill="#ffffff" stroke="none" className="play-triangle-icon" />
                      </div>
                    </div>
                    <div className="video-timeline-bar" aria-hidden="true">
                      <div className="video-timeline-progress"></div>
                    </div>
                    <div className="video-meta-top-badge">
                      <span>Format 9:16 Mobile</span>
                    </div>
                    <div className="video-duration-pill">
                      <span>0:25</span>
                    </div>
                  </div>
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
                </div>

                {/* ÉTAPE 4 : Carte Module 4 (Publication & Viralité) */}
                <div className="flow-step-block">
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
                      Les techniques pour poster efficacement, attirer l'algorithme TikTok, Reels et Shorts et faire grimper rapidement votre nombre d'abonnés.
                    </p>
                  </div>
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
    </div>
  );
}

export default FormationsBookView;


