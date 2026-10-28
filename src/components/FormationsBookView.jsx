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
  Lightbulb 
} from 'lucide-react';
import { currencyService } from '../services/currencyService';
import './FormationsBookView.css';

export function FormationsBookView({ onClose, onUnlockBook, onGoToServices, activePromo: propActivePromo }) {
  const [mobileActiveTab, setMobileActiveTab] = useState('bd'); // 'bd' | 'video'
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());
  const [originalPrices, setOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [, setCurrentCountry] = useState(() => currencyService.getCurrentCountry());
  const [previewModal, setPreviewModal] = useState(null); // 'bd' | 'video' | null

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

  // Calcul des réductions avec code promo
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
      {/* Modal d'aperçu d'un résultat réel (BD ou Vidéo) */}
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
                {previewModal === 'bd' ? '🎨 Exemple de Bande Dessinée Réalisée' : '🎬 Exemple de Vidéo Virale Réalisée'}
              </span>
              <h3 className="result-modal-title">
                {previewModal === 'bd' 
                  ? 'Ce que vous allez créer dès aujourd\'hui' 
                  : 'Le style de vidéos virales prêtes pour TikTok & Reels'}
              </h3>
              <p className="result-modal-subtitle">
                100% réalisé sur un simple smartphone avec des outils d'Intelligence Artificielle 100% gratuits.
              </p>
            </div>

            <div className="formation-result-modal-body">
              {previewModal === 'bd' ? (
                <div className="result-modal-image-wrapper">
                  <img 
                    src="/images/formation/comic-strip-preview.jpg" 
                    alt="Aperçu Bande Dessinée Réalisée par IA" 
                    className="result-modal-preview-img"
                  />
                  <div className="result-modal-caption">
                    <span>✨ Épisode complet Musa & Amina avec dialogues et lettrage professionnel</span>
                  </div>
                </div>
              ) : (
                <div className="result-modal-image-wrapper video-mockup-wrapper">
                  <img 
                    src="/images/formation/video-story-preview.jpg" 
                    alt="Aperçu Vidéo Animée IA Mobile" 
                    className="result-modal-preview-img video-preview-img"
                  />
                  <div className="result-modal-caption">
                    <span>🔥 Animation cinématographique 9:16 prête pour des centaines de milliers de vues</span>
                  </div>
                </div>
              )}
            </div>

            <div className="formation-result-modal-footer">
              <button 
                type="button" 
                className="btn-modal-action-unlock"
                onClick={() => {
                  const targetBook = previewModal === 'bd' ? bookBD : bookVideo;
                  const targetPrice = previewModal === 'bd' ? finalBdPrice : finalVideoPrice;
                  const targetOrig = previewModal === 'bd' ? origBdPrice : origVideoPrice;
                  setPreviewModal(null);
                  onUnlockBook({ ...targetBook, price: targetPrice, originalPrice: targetOrig });
                }}
              >
                <Sparkles size={16} />
                <span>Je veux apprendre à faire exactement ça !</span>
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
          {/* Croix rouge en haut à droite */}
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
                <span className="page-category-tag">Bandes dessinées</span>
                {bdReductionPct > 0 && !isBDUnlocked && (
                  <span className="promo-applied-chip">
                    ✨ Code <strong>{activePromo.code}</strong> actif (-{bdReductionPct}%)
                  </span>
                )}
              </div>

              {/* SECTION HERO VISUELLE : COUVERTURE 3D + MINIATURE D'EXEMPLE RÉEL */}
              <div className="formation-visual-hero-row">
                {/* Livre 3D */}
                <div className="hero-book-cover-col">
                  <img 
                    src="/books/book_bd_cover.png" 
                    alt="Livre BD & Storytelling Mr Ben" 
                    className="book-hero-3d-img"
                  />
                  {/* Badge de prix barré discret sous la couverture */}
                  <div className={`book-price-badge ${isBDUnlocked ? 'is-unlocked' : ''} ${bdReductionPct > 0 && !isBDUnlocked ? 'has-discount' : ''}`}>
                    {isBDUnlocked ? (
                      <span className="price-tag">✓ Débloqué</span>
                    ) : bdReductionPct > 0 ? (
                      <div className="promo-badge-prices">
                        <span className="promo-old-price">{baseBdPrice.toLocaleString()} F</span>
                        <span className="price-tag promo-new-price">{finalBdPrice.toLocaleString()} FCFA</span>
                      </div>
                    ) : (
                      <div className="book-price-strikethrough-wrap">
                        <span className="price-tag-struck">{bdPair.originalFormatted}</span>
                        <span className="price-tag">{bdPair.currentFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carte résultat concret (Ce que vous allez créer) */}
                <div 
                  className="hero-concrete-sample-card" 
                  onClick={() => {
                    analyticsService.trackButtonClick('preview_sample_bd', 'livre-bd-storytelling', '#formations');
                    setPreviewModal('bd');
                  }}
                  title="Cliquer pour agrandir le résultat réel"
                >
                  <div className="concrete-sample-img-box">
                    <img 
                      src="/images/formation/comic-strip-preview.jpg" 
                      alt="Exemple réel de BD créée" 
                      className="concrete-sample-thumbnail"
                    />
                    <div className="sample-hover-overlay">
                      <Eye size={18} />
                      <span>Agrandir</span>
                    </div>
                  </div>
                  <div className="concrete-sample-tag">
                    <Sparkles size={11} className="sample-sparkle" />
                    <span>Exemple réel créé</span>
                  </div>
                </div>
              </div>

              {/* Titre & Sous-titre punchy */}
              <div className="book-page-body">
                <h2 className="formation-book-title">
                  L'Art du Storytelling & Bandes Dessinées
                </h2>
                <p className="formation-catchy-lead">
                  Créez des feuilletons illustrés qui rendent accro et attirez une foule d'abonnés sur vos réseaux.
                </p>

                {/* 3 Badges Clés (Smartphone, 100% Gratuit, Mentorat Mr Ben) */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <Smartphone size={13} />
                    <span>100% sur Smartphone</span>
                  </div>
                  <div className="key-pill pill-free">
                    <Gift size={13} />
                    <span>Outils IA 100% Gratuits</span>
                  </div>
                  <div className="key-pill pill-mentorship">
                    <Crown size={13} />
                    <span>Assistance Privée Mr Ben</span>
                  </div>
                </div>

                {/* 4 PILIERS SOUS FORME DE CARTES VISUELLES COMPACTES (2x2) */}
                <div className="formation-pillars-grid">
                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-bulb">
                      <Lightbulb size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>1. Scénarios & Suspense</strong>
                      <p>Imaginer des histoires qui donnent envie de voir la suite.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-palette">
                      <Palette size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>2. Génération d'Images IA</strong>
                      <p>Créer chaque scène action par action avec un style percutant.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-chat">
                      <MessageSquare size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>3. Bulles & Lettrage Pro</strong>
                      <p>Placer dialogues et émotions facilement sur mobile.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-growth">
                      <TrendingUp size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>4. Abonnés & Croissance</strong>
                      <p>Fidéliser une communauté engagée prête à vous suivre.</p>
                    </div>
                  </div>
                </div>

                {/* Barre de confiance : Choix de niche & Service de monétisation */}
                <div className="mentorship-trust-bar">
                  <div className="trust-mentorship-line">
                    <CheckCircle2 size={13} className="trust-check-icon" />
                    <span><strong>Accompagnement privé :</strong> Mr Ben vous guide pas-à-pas pour choisir votre niche.</span>
                  </div>
                  <div className="trust-services-line">
                    <span>
                      Besoin d'un compte monétisable clé en main ?{' '}
                      <button 
                        type="button" 
                        className="services-link-inline-btn"
                        onClick={() => {
                          analyticsService.trackButtonClick('btn_services', 'services', '#formations');
                          onGoToServices();
                        }}
                      >
                        « Nos Services »
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton Débloquer rigoureusement aligné au bas */}
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
                        <Sparkles size={15} className="btn-unlock-sparkle" />
                        <span className="btn-unlock-title">Débloquer cette formation</span>
                        <ArrowRight size={14} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        {bdReductionPct > 0 ? (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-discounted">{finalBdPrice.toLocaleString()} FCFA</span>
                            <span className="btn-price-struck">{baseBdPrice.toLocaleString()} FCFA</span>
                            <span className="btn-promo-tag">-{bdReductionPct}%</span>
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
                <span className="page-category-tag video-tag">Vidéo avec IA</span>
                {videoReductionPct > 0 && !isVideoUnlocked && (
                  <span className="promo-applied-chip video-chip">
                    ✨ Code <strong>{activePromo.code}</strong> actif (-{videoReductionPct}%)
                  </span>
                )}
              </div>

              {/* SECTION HERO VISUELLE : COUVERTURE 3D + MINIATURE D'EXEMPLE RÉEL VIDÉO */}
              <div className="formation-visual-hero-row">
                {/* Livre 3D */}
                <div className="hero-book-cover-col">
                  <img 
                    src="/books/book_video_cover.png?v=2" 
                    alt="Livre Vidéos Virales IA Mr Ben" 
                    className="book-hero-3d-img"
                  />
                  {/* Badge de prix barré sous la couverture */}
                  <div className={`book-price-badge video-price ${isVideoUnlocked ? 'is-unlocked' : ''} ${videoReductionPct > 0 && !isVideoUnlocked ? 'has-discount' : ''}`}>
                    {isVideoUnlocked ? (
                      <span className="price-tag">✓ Débloqué</span>
                    ) : videoReductionPct > 0 ? (
                      <div className="promo-badge-prices">
                        <span className="promo-old-price video-old">{baseVideoPrice.toLocaleString()} F</span>
                        <span className="price-tag promo-new-price video-new">{finalVideoPrice.toLocaleString()} FCFA</span>
                      </div>
                    ) : (
                      <div className="book-price-strikethrough-wrap">
                        <span className="price-tag-struck">{videoPair.originalFormatted}</span>
                        <span className="price-tag">{videoPair.currentFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carte résultat concret (Ce que vous allez animer) */}
                <div 
                  className="hero-concrete-sample-card video-sample-card" 
                  onClick={() => {
                    analyticsService.trackButtonClick('preview_sample_video', 'livre-videos-ia', '#formations');
                    setPreviewModal('video');
                  }}
                  title="Cliquer pour voir l'aperçu vidéo viral"
                >
                  <div className="concrete-sample-img-box video-box-crop">
                    <img 
                      src="/images/formation/video-story-preview.jpg" 
                      alt="Exemple réel de vidéo virale animée par IA" 
                      className="concrete-sample-thumbnail video-thumbnail"
                    />
                    <div className="sample-hover-overlay">
                      <Play size={20} fill="#ffffff" />
                      <span>Aperçu</span>
                    </div>
                  </div>
                  <div className="concrete-sample-tag video-sample-tag">
                    <Play size={10} fill="currentColor" />
                    <span>245K Vues Réalisable</span>
                  </div>
                </div>
              </div>

              {/* Titre & Sous-titre punchy */}
              <div className="book-page-body">
                <h2 className="formation-book-title">
                  Création de Vidéos Virales avec l'IA
                </h2>
                <p className="formation-catchy-lead">
                  Transformez des images fixes en vidéos spectaculaires et faites exploser vos vues TikTok & Reels.
                </p>

                {/* 3 Badges Clés (Montage Mobile, IA Gratuite, Viralité) */}
                <div className="formation-key-pills-row">
                  <div className="key-pill pill-phone">
                    <Smartphone size={13} />
                    <span>Montage sur Mobile</span>
                  </div>
                  <div className="key-pill pill-free">
                    <Gift size={13} />
                    <span>Animation IA Gratuite</span>
                  </div>
                  <div className="key-pill pill-mentorship pill-trending">
                    <Zap size={13} />
                    <span>Format Viral TikTok/Reels</span>
                  </div>
                </div>

                {/* 4 PILIERS SOUS FORME DE CARTES VISUELLES COMPACTES (2x2) */}
                <div className="formation-pillars-grid">
                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-film">
                      <Film size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>1. Découpage Rythmé</strong>
                      <p>Scénariser des clips courts qui retiennent l'attention.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-zap">
                      <Zap size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>2. Mouvements par IA</strong>
                      <p>Animer personnages, regards et décors sans payer de logiciel.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-voice">
                      <Sparkles size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>3. Montage & Voix Off</strong>
                      <p>Assembler clips, musiques et signature directement sur smartphone.</p>
                    </div>
                  </div>

                  <div className="pillar-mini-card">
                    <div className="pillar-icon-wrap pillar-growth-blue">
                      <TrendingUp size={14} />
                    </div>
                    <div className="pillar-text">
                      <strong>4. Explosion de Vues</strong>
                      <p>Optimiser vos vidéos pour l'algorithme TikTok et Shorts.</p>
                    </div>
                  </div>
                </div>

                {/* Barre de confiance : Choix de niche & Service de monétisation */}
                <div className="mentorship-trust-bar">
                  <div className="trust-mentorship-line">
                    <CheckCircle2 size={13} className="trust-check-icon" />
                    <span><strong>Accompagnement privé :</strong> Mr Ben vous guide pas-à-pas pour choisir votre niche.</span>
                  </div>
                  <div className="trust-services-line">
                    <span>
                      Besoin d'un compte monétisable clé en main ?{' '}
                      <button 
                        type="button" 
                        className="services-link-inline-btn"
                        onClick={() => {
                          analyticsService.trackButtonClick('btn_services', 'services', '#formations');
                          onGoToServices();
                        }}
                      >
                        « Nos Services »
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton Débloquer rigoureusement aligné au bas */}
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
                        <Sparkles size={15} className="btn-unlock-sparkle" />
                        <span className="btn-unlock-title">Débloquer cette formation</span>
                        <ArrowRight size={14} className="btn-unlock-arrow" />
                      </div>
                      <div className="btn-unlock-subline">
                        {videoReductionPct > 0 ? (
                          <div className="btn-unlock-price-tags">
                            <span className="btn-price-discounted">{finalVideoPrice.toLocaleString()} FCFA</span>
                            <span className="btn-price-struck">{baseVideoPrice.toLocaleString()} FCFA</span>
                            <span className="btn-promo-tag">-{videoReductionPct}%</span>
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

