import React, { useState } from 'react';
import { BOOKS_DATA } from '../data/booksData';
import { storageService } from '../services/storageService';
import { Sparkles, ArrowRight, CheckCircle2, Award, Info } from 'lucide-react';
import './FormationsBookView.css';

export function FormationsBookView({ onClose, onUnlockBook, onGoToServices }) {
  const [mobileActiveTab, setMobileActiveTab] = useState('bd'); // 'bd' | 'video'

  const bookBD = BOOKS_DATA.find((b) => b.id === 'livre-bd-storytelling') || BOOKS_DATA[0];
  const bookVideo = BOOKS_DATA.find((b) => b.id === 'livre-videos-ia') || BOOKS_DATA[1];

  const isBDUnlocked = storageService.isBookUnlocked(bookBD.id);
  const isVideoUnlocked = storageService.isBookUnlocked(bookVideo.id);

  return (
    <div className="formations-book-viewport">
      {/* Sélecteur mobile (visible uniquement sur petit écran) */}
      <div className="book-mobile-tab-switch">
        <button 
          className={`mobile-tab-btn ${mobileActiveTab === 'bd' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('bd')}
        >
          <span>Page 1 : Bandes dessinées</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileActiveTab === 'video' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('video')}
        >
          <span>Page 2 : Vidéo avec IA</span>
        </button>
      </div>

      {/* CONTENEUR DU LIVRE OUVERT (BIEN PROPORTIONNÉ, ÉLOIGNÉ DES BORDS ET DU BAS) */}
      <div className="book-multipage-wrapper">
        {/* Épaisseur des feuillets sur les tranches gauche & droite */}
        <div className="book-pages-stack-edge left-edge" aria-hidden="true"></div>
        <div className="book-pages-stack-edge right-edge" aria-hidden="true"></div>

        {/* LE GRAND LIVRE BLANC CASSÉ / IVOIRE ÉLÉGANT */}
        <div className="open-book-spread ivory-book-theme">
          {/* Petite croix rouge sans carte en haut à droite */}
          <button 
            className="book-close-red-cross"
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer"
          >
            ✕
          </button>

          {/* LE RUBAN ROUGE MARQUE-PAGE AU MILIEU DU LIVRE */}
          <div className="red-ribbon-bookmark" aria-hidden="true">
            <div className="ribbon-tail"></div>
          </div>

          {/* LIGNE DE PLIURE / RELIURE CENTRALE */}
          <div className="book-center-spine" aria-hidden="true"></div>

          {/* ====================================================================
              PAGE DE GAUCHE : FORMATION 1 (BANDES DESSINÉES)
              ==================================================================== */}
          <div className={`book-page left-page ${mobileActiveTab === 'bd' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="page-inner-content page-fade-in">
              <div className="page-header-row">
                <span className="page-category-tag">Bandes dessinées</span>
              </div>

              {/* Sticker du Livre 1 100% détouré sans fond */}
              <div className="book-sticker-container">
                <img 
                  src="/books/book_bd_cover.png" 
                  alt="Livre BD & Storytelling Mr Ben" 
                  className="book-sticker-img"
                />
                <div className={`book-price-badge ${isBDUnlocked ? 'is-unlocked' : ''}`}>
                  <span className="price-tag">{isBDUnlocked ? "✓ Débloqué" : "2 500 FCFA"}</span>
                  {!isBDUnlocked && <span className="badge-highlight">Best-Seller</span>}
                </div>
              </div>

              {/* Contenu calibré pour un alignement horizontal parfait */}
              <div className="book-page-body">
                <h2 className="formation-book-title">
                  L'Art du Storytelling & Bandes Dessinées
                </h2>
                <p className="formation-author-line">
                  Par Mr Ben • Le guide complet pour créer vos histoires sans rien dépenser
                </p>

                <p className="formation-lead-desc">
                  Ici, vous suivez tout le guide pas-à-pas pour donner vie à vos propres bandes dessinées et captiver votre audience. Tout ce dont vous avez besoin, c'est simplement de <strong>votre téléphone portable et d'une connexion internet</strong>. <em>(Et que personne ne vous trompe : tous les outils d'IA utilisés sont <strong>100% gratuits</strong>, vous créez tout de A à Z sans dépenser un seul centime).</em>
                </p>

                {/* 4 piliers d'apprentissage réels */}
                <div className="formation-highlights-box">
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Trouver de très belles histoires :</strong> comment imaginer facilement des scénarios captivants qui donnent immédiatement envie de voir la suite.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Créer des images magnifiques action par action :</strong> comment illustrer chaque scène de votre histoire pour en faire des épisodes spectaculaires.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Mettre les discussions sur l'image :</strong> comment insérer les dialogues et les bulles pour faire parler vos personnages avec émotion.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Gérer ses publications & bâtir sa communauté :</strong> les meilleures méthodes pour poster sur vos réseaux sociaux et fidéliser une vraie communauté.</span>
                  </div>
                </div>

                {/* Super Bonus offert */}
                <div className="bonus-mini-callout">
                  <Award size={14} className="bonus-icon" />
                  <span><strong>Super Bonus offert :</strong> Publicité de votre page après la formation</span>
                </div>

                {/* Note discrète placée en bas du Super Bonus */}
                <div className="formation-discrete-note">
                  <Info size={13} className="discrete-note-icon" />
                  <span>
                    <em>Note :</em> Si vous souhaitez gagner de l'argent grâce à vos contenus, nous pouvons aussi vous créer directement des comptes monétisables (Facebook, TikTok ou YouTube) disponibles dans notre section{' '}
                    <button 
                      type="button" 
                      className="services-link-inline-btn"
                      onClick={onGoToServices}
                    >
                      « Nos Services »
                    </button>.
                  </span>
                </div>
              </div>

              {/* Bouton Débloquer rigoureusement aligné au bas */}
              <div className="page-bottom-actions">
                {isBDUnlocked ? (
                  <button 
                    className="btn-unlock-formation-card book-unlocked-btn"
                    onClick={() => onUnlockBook(bookBD)}
                  >
                    <CheckCircle2 size={15} className="unlocked-icon-check" />
                    <span>Formation Débloquée • Ouvrir</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button 
                    className="btn-unlock-formation-card"
                    onClick={() => onUnlockBook(bookBD)}
                  >
                    <Sparkles size={14} />
                    <span>Débloquer cette formation (2 500 F)</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================================
              PAGE DE DROITE : FORMATION 2 (VIDÉO AVEC IA)
              ==================================================================== */}
          <div className={`book-page right-page ${mobileActiveTab === 'video' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="page-inner-content page-fade-in">
              <div className="page-header-row">
                <span className="page-category-tag video-tag">Vidéo avec IA</span>
              </div>

              {/* Sticker du Livre 2 100% détouré sans artefact */}
              <div className="book-sticker-container">
                <img 
                  src="/books/book_video_cover.png?v=2" 
                  alt="Livre Vidéos Virales IA Mr Ben" 
                  className="book-sticker-img"
                />
                <div className={`book-price-badge video-price ${isVideoUnlocked ? 'is-unlocked' : ''}`}>
                  <span className="price-tag">{isVideoUnlocked ? "✓ Débloqué" : "3 100 FCFA"}</span>
                  {!isVideoUnlocked && <span className="badge-highlight">Tendance 2026</span>}
                </div>
              </div>

              {/* Contenu calibré pour un alignement horizontal parfait */}
              <div className="book-page-body">
                <h2 className="formation-book-title">
                  Création de Vidéos Virales avec l'IA
                </h2>
                <p className="formation-author-line">
                  Par Mr Ben • Le guide complet pour animer vos visuels sans rien dépenser
                </p>

                <p className="formation-lead-desc">
                  Ici, vous suivez tout le guide pas-à-pas pour transformer de simples images en vidéos captivantes et dynamiques. Tout ce dont vous avez besoin, c'est simplement de <strong>votre téléphone portable et d'une connexion internet</strong>. <em>(Et que personne ne vous trompe : tous les outils d'IA utilisés sont <strong>100% gratuits</strong>, vous réalisez vos vidéos sans payer le moindre abonnement).</em>
                </p>

                {/* 4 piliers d'apprentissage réels */}
                <div className="formation-highlights-box">
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Scénariser des vidéos captivantes :</strong> comment découper votre histoire en courtes séquences rythmées qui retiennent l'attention de bout en bout.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Donner vie et mouvement à vos images :</strong> comment animer vos personnages, leurs regards et leurs décors de manière fluide et naturelle.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Assembler et signer vos feuilletons :</strong> comment fusionner vos clips en quelques clics sur mobile, apposer votre signature de chaîne et finaliser vos vidéos sans logiciel payant.</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle2 size={13} className="highlight-icon" />
                    <span><strong>Publier & faire exploser vos vues :</strong> les techniques pour poster des vidéos virales et attirer des milliers d'abonnés sur vos comptes.</span>
                  </div>
                </div>

                {/* Super Bonus offert */}
                <div className="bonus-mini-callout">
                  <Award size={14} className="bonus-icon" />
                  <span><strong>Super Bonus offert :</strong> Publicité de votre page après la formation</span>
                </div>

                {/* Note discrète placée en bas du Super Bonus */}
                <div className="formation-discrete-note">
                  <Info size={13} className="discrete-note-icon" />
                  <span>
                    <em>Note :</em> Si vous souhaitez gagner de l'argent grâce à vos contenus, nous pouvons aussi vous créer directement des comptes monétisables (Facebook, TikTok ou YouTube) disponibles dans notre section{' '}
                    <button 
                      type="button" 
                      className="services-link-inline-btn"
                      onClick={onGoToServices}
                    >
                      « Nos Services »
                    </button>.
                  </span>
                </div>
              </div>

              {/* Bouton Débloquer rigoureusement aligné au bas */}
              <div className="page-bottom-actions">
                {isVideoUnlocked ? (
                  <button 
                    className="btn-unlock-formation-card video-card-btn book-unlocked-btn"
                    onClick={() => onUnlockBook(bookVideo)}
                  >
                    <CheckCircle2 size={15} className="unlocked-icon-check" />
                    <span>Formation Débloquée • Ouvrir</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button 
                    className="btn-unlock-formation-card video-card-btn"
                    onClick={() => onUnlockBook(bookVideo)}
                  >
                    <Sparkles size={14} />
                    <span>Débloquer cette formation (3 100 F)</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormationsBookView;
