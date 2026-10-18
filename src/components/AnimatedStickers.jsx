import React, { useState } from 'react';
import './AnimatedStickers.css';

export function AnimatedStickers() {
  const [activeSpeech, setActiveSpeech] = useState(null);

  const handleStickerClick = (id, text) => {
    setActiveSpeech({ id, text });
    setTimeout(() => {
      setActiveSpeech(null);
    }, 2800);
  };

  return (
    <div className="stickers-stage-container" aria-hidden="true">
      {/* Message texte aérien et stylé lors de la rencontre au centre (sans carte bouton) */}
      <div className="encounter-greeting-text">
        Faites nous confiance !
      </div>

      {/* 1. Sticker Garçon (Storyteller) */}
      <div 
        className="sticker-walker sticker-walker-boy"
        onClick={() => handleStickerClick('boy', 'Je crée ma BD IA en quelques clics ! 🎨')}
      >
        {activeSpeech?.id === 'boy' && (
          <div className="sticker-popup-bubble">{activeSpeech.text}</div>
        )}
        <div className="sticker-inner-step">
          <img 
            src="/stickers/sticker_boy.png" 
            alt="Garçon créateur de BD" 
            className="sticker-graphic"
            draggable="false"
          />
        </div>
      </div>

      {/* 2. Sticker Fille (Artiste BD Numérique) */}
      <div 
        className="sticker-walker sticker-walker-girl"
        onClick={() => handleStickerClick('girl', 'Mes stories cartonnent déjà ! ✨')}
      >
        {activeSpeech?.id === 'girl' && (
          <div className="sticker-popup-bubble">{activeSpeech.text}</div>
        )}
        <div className="sticker-inner-step">
          <img 
            src="/stickers/sticker_girl.png" 
            alt="Fille artiste BD numérique" 
            className="sticker-graphic"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}

export default AnimatedStickers;
