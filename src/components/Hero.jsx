import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Video, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import './Hero.css';
import { LAUNCH_BONUS } from '../data/servicesData';

export function Hero({ selectedBookId, onSelectBook, onOpenBonusModal }) {
  const [prices, setPrices] = useState(() => storageService.getFormationPrices());

  useEffect(() => {
    const updatePrices = (e) => {
      setPrices(e.detail || storageService.getFormationPrices());
    };
    window.addEventListener('mrben_price_changed', updatePrices);
    window.addEventListener('storage', () => setPrices(storageService.getFormationPrices()));
    return () => {
      window.removeEventListener('mrben_price_changed', updatePrices);
    };
  }, []);

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
          <span className="segment-price">{(prices['livre-bd-storytelling'] || 2500).toLocaleString()} F</span>
        </button>

        <button 
          className={`segment-btn ${selectedBookId === 'livre-videos-ia' ? 'active' : ''}`}
          onClick={() => onSelectBook('livre-videos-ia')}
        >
          <Video size={14} />
          <span>Livre 2 : Vidéos IA</span>
          <span className="segment-price">{(prices['livre-videos-ia'] || 3100).toLocaleString()} F</span>
        </button>
      </div>
    </section>
  );
}
