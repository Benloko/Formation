import React, { useState, useEffect } from 'react';
import './TypewriterMessage.css';

// 3 messages captivants de même gabarit et équilibrés
const MESSAGES = [
  {
    line1: "Devenez créateur de contenus captivants sur vos réseaux très facilement.",
    line2: "Choisissez votre formation et lancez-vous sereinement : votre réussite est garantie !"
  },
  {
    line1: "Maîtrisez le storytelling et la vidéo IA pour faire décoller votre audience.",
    line2: "Débloquez nos méthodes pas à pas et transformez votre passion en vrai succès !"
  },
  {
    line1: "Multipliez vos abonnés et monétisez vos créations sans aucune expérience.",
    line2: "Suivez nos formations exclusives et concrétisez tous vos projets dès maintenant !"
  }
];

export function TypewriterMessage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'reading' | 'fading' | 'pause'

  const currentMsg = MESSAGES[messageIndex];
  const fullText = `${currentMsg.line1}\n${currentMsg.line2}`;
  const line1Length = currentMsg.line1.length;
  const line2StartIndex = line1Length + 1;

  useEffect(() => {
    let timer;

    if (phase === 'typing') {
      if (charIndex < fullText.length) {
        const nextChar = fullText[charIndex];

        // Vitesse d'écriture posée ("molo molo") pour voir la main tracer chaque lettre
        let delay = 62;
        if (nextChar === '\n') {
          delay = 420; // pause naturelle entre la ligne 1 et la ligne 2
        } else if (nextChar === ',' || nextChar === ':') {
          delay = 200; // respiration naturelle sur la ponctuation
        } else if (nextChar === '.') {
          delay = 240;
        }

        timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, delay);
      } else {
        // Fin de l'écriture -> reste affiché pendant 7 secondes sans clignoter
        timer = setTimeout(() => {
          setPhase('reading');
        }, 200);
      }
    } else if (phase === 'reading') {
      // Reste affiché paisiblement pendant exactement 7 secondes
      timer = setTimeout(() => {
        setPhase('fading');
      }, 7000);
    } else if (phase === 'fading') {
      // Disparition en fondu doux (700ms)
      timer = setTimeout(() => {
        setPhase('pause');
        setCharIndex(0);
      }, 700);
    } else if (phase === 'pause') {
      // Petite pause de transition puis passage au message suivant
      timer = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setPhase('typing');
      }, 800);
    }

    return () => clearTimeout(timer);
  }, [phase, charIndex, fullText]);

  // Découpage strict du texte tapé (aucune lettre affichée en avance)
  const currentLine1 = charIndex <= line1Length 
    ? currentMsg.line1.slice(0, charIndex) 
    : currentMsg.line1;

  const hasStartedLine2 = charIndex > line1Length;
  const currentLine2 = hasStartedLine2 
    ? currentMsg.line2.slice(0, charIndex - line2StartIndex) 
    : '';

  const isTypingLine1 = charIndex <= line1Length;
  const isComplete = charIndex >= fullText.length;

  return (
    <div className={`typewriter-container phase-${phase}`} aria-live="polite">
      <div className="typewriter-content-box">
        {/* Ligne 1 */}
        <p className="typewriter-line line-1">
          {currentLine1}
          {phase === 'typing' && isTypingLine1 && (
            <span className="writing-hand-emoji" aria-hidden="true">✍️</span>
          )}
        </p>

        {/* Ligne 2 */}
        {hasStartedLine2 && (
          <p className="typewriter-line line-2">
            {currentLine2}
            {phase === 'typing' && !isTypingLine1 && !isComplete && (
              <span className="writing-hand-emoji" aria-hidden="true">✍️</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default TypewriterMessage;
