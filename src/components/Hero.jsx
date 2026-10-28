import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Video, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { currencyService } from '../services/currencyService';
import './Hero.css';
import { LAUNCH_BONUS } from '../data/servicesData';

export function Hero({ selectedBookId, onSelectBook, onOpenBonusModal }) {
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());
  const [originalPrices, setOriginalPrices] = useState(() => storageService.getFormationOriginalPrices());
  const [, setCurrentCountry] = useState(() => currencyService.getCurrentCountry());

  useEffect(() => {
    const updatePrices = (e) => {
      setPrices(e.detail?.prices || storageService.getFormationPrices());
      setOriginalPrices(e.detail?.originalPrices || storageService.getFormationOriginalPrices());
    };
    const updateCurrency = (e) => {
      setCurrentCountry(e.detail || currencyService.getCurrentCountry());
    };

    window.addEventListener('mrben_price_changed', updatePrices);
    window.addEventListener('mrben_currency_changed', updateCurrency);
    window.addEventListener('storage', () => {
      setPrices(storageService.getFormationPrices());
      setOriginalPrices(storageService.getFormationOriginalPrices());
    });
    return () => {
      window.removeEventListener('mrben_price_changed', updatePrices);
      window.removeEventListener('mrben_currency_changed', updateCurrency);
    };
  }, []);

  const bdPair = currencyService.formatPricePair(
    prices['livre-bd-storytelling'] || 2500,
    originalPrices['livre-bd-storytelling'] || 5000,
    { compact: true }
  );

  const videoPair = currencyService.formatPricePair(
    prices['livre-videos-ia'] || 3100,
    originalPrices['livre-videos-ia'] || 6000,
    { compact: true }
  );

  return (
    <section className="hero-section">
      {/* Badge discret */}
      <div className="hero-badge">
        <Sparkles size={12} className="badge-sparkle" />
        <span>Méthode Officielle Mr Ben</span>
      </div>

      {/* Titre sobre et proportionné */}
      <h1 className="hero-title">
        Storytelling & Création de <span className="highlight-text">Bandes Dessinées IA</span>
      </h1>

      <p className="hero-subtitle">
        Apprenez pas-à-pas à captiver votre audience sur 200+ épisodes. Feuilletez nos guides interactifs en ligne pour reproduire la méthode exacte.
      </p>

      {/* Notification discrète du Bonus (sans grosse carte) */}
      <div className="hero-bonus-inline" onClick={onOpenBonusModal}>
        <span className="bonus-pill">🎁 Bonus offert</span>
        <span className="bonus-msg">Mr Ben booste et partage votre page auprès de son audience pour lancer vos abonnés</span>
        <span className="bonus-link">Voir <ChevronRight size={13} /></span>
      </div>

      {/* Barre d'onglets compacte (Segmented Control sobre) */}
      <div className="book-segment-bar">
        <button 
          className={`segment-btn ${selectedBookId === 'livre-bd-storytelling' ? 'active' : ''}`}
          onClick={() => onSelectBook('livre-bd-storytelling')}
        >
          <BookOpen size={14} />
          <span>Livre 1 : BD & Storytelling</span>
          <span className="segment-price-group">
            <span className="segment-price-struck">{bdPair.originalFormatted}</span>
            <span className="segment-price">{bdPair.currentFormatted}</span>
          </span>
        </button>

        <button 
          className={`segment-btn ${selectedBookId === 'livre-videos-ia' ? 'active' : ''}`}
          onClick={() => onSelectBook('livre-videos-ia')}
        >
          <Video size={14} />
          <span>Livre 2 : Vidéos IA</span>
          <span className="segment-price-group">
            <span className="segment-price-struck">{videoPair.originalFormatted}</span>
            <span className="segment-price">{videoPair.currentFormatted}</span>
          </span>
        </button>
      </div>
    </section>
  );
}
