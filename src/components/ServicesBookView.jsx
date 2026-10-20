import React from 'react';
import { SERVICES_DATA, CREATOR_PROFILE } from '../data/servicesData';
import { 
  Globe, 
  Flame, 
  ShieldCheck, 
  Megaphone, 
  Code2, 
  ArrowUpRight, 
  MessageCircle, 
  Mail, 
  Sparkles,
  X 
} from 'lucide-react';
import './ServicesBookView.css';

const SERVICE_ICONS = {
  'pages-facebook': Globe,
  'comptes-tiktok': Flame,
  'comptes-facebook': ShieldCheck,
  'publicite-boost': Megaphone,
  'dev-applications': Code2
};

export function ServicesBookView({ onClose }) {
  const handleContactService = (service) => {
    const text = encodeURIComponent(service.whatsappMessage);
    window.open(`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleGeneralWhatsApp = () => {
    const text = encodeURIComponent("Bonjour Mr Ben, j'ai besoin d'un accompagnement personnalisé pour mon projet.");
    window.open(`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleGeneralEmail = () => {
    const email = CREATOR_PROFILE.email || "mrbenofficiel6@gmail.com";
    window.open(`mailto:${email}?subject=${encodeURIComponent("Projet Sur-Mesure - Contact Mr Ben")}`, '_blank');
  };

  return (
    <div className="services-book-viewport">
      {/* CONTENEUR DE LA PAGE UNIQUE DU LIVRE D'ART */}
      <div className="single-book-wrapper">
        {/* Épaisseur des feuillets sur la tranche du livre */}
        <div className="single-book-stack-edge left-stack" aria-hidden="true"></div>
        <div className="single-book-stack-edge right-stack" aria-hidden="true"></div>

        {/* LA GRANDE PAGE DE LIVRE IVOIRE / PAPIER D'ART NOBLE */}
        <div className="single-book-page-sheet">
          {/* Petite croix rouge sans carte en haut à droite */}
          <button 
            className="book-close-red-cross"
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* RUBAN ROUGE MARQUE-PAGE COURT ET POSITIONNÉ EN MARGE (NE TOUCHE AUCUN TEXTE) */}
          <div className="single-page-red-ribbon" aria-hidden="true">
            <div className="ribbon-tail"></div>
          </div>

          <div className="single-page-scrollable-content">
            {/* En-tête de la page de livre (sans mention d'édition superflue) */}
            <div className="single-page-header">
              <div className="header-meta-row">
                <span className="service-category-tag">Accompagnement & Solutions Clés en Main</span>
              </div>
              <h1 className="single-page-main-title">Nos Services Professionnels</h1>
              <p className="single-page-subtitle">
                Des actifs digitaux prêts à l'emploi, des créations de comptes monétisables et des formations pratiques pour accélérer vos activités sans repartir de zéro.
              </p>
            </div>

            {/* Grille harmonieuse des 5 services */}
            <div className="services-cards-grid">
              {SERVICES_DATA.map((service, index) => {
                const IconComponent = SERVICE_ICONS[service.id] || Sparkles;
                return (
                  <div 
                    key={service.id} 
                    className="service-book-card"
                    onClick={() => handleContactService(service)}
                  >
                    <div className="service-card-top">
                      <div className="service-icon-box">
                        <IconComponent size={16} />
                      </div>
                      <div className="service-badges-row">
                        <span className="service-index-number">N° 0{index + 1}</span>
                        <span className="service-status-pill">{service.tag}</span>
                      </div>
                    </div>

                    <h3 className="service-card-title">{service.title}</h3>
                    <p className="service-card-desc">{service.shortDesc}</p>

                    <div className="service-card-footer">
                      <span className="order-link-text">Je suis intéressé</span>
                      <ArrowUpRight size={14} className="order-link-arrow" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Encart bas de page : Deux boutons propres et discrets (WhatsApp & Gmail) */}
            <div className="services-custom-box">
              <div className="custom-box-left">
                <div className="custom-box-icon-circle">
                  <Sparkles size={17} className="custom-sparkle-icon" />
                </div>
                <div>
                  <strong>Besoin d'un accompagnement personnalisé ou d'un projet spécial ?</strong>
                  <p>Mr Ben vous répond rapidement pour étudier vos besoins spécifiques et collaborer sur votre projet.</p>
                </div>
              </div>
              <div className="custom-box-mini-actions">
                <button 
                  className="btn-mini-contact-action whatsapp-mini"
                  onClick={handleGeneralWhatsApp}
                  title="Écrire sur WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>
                <button 
                  className="btn-mini-contact-action gmail-mini"
                  onClick={handleGeneralEmail}
                  title="Écrire par Gmail"
                >
                  <Mail size={14} />
                  <span>Gmail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesBookView;
