import React, { useState } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Globe,
  X 
} from 'lucide-react';
import { CREATOR_PROFILE } from '../data/servicesData';
import './ContactBookView.css';

export function ContactBookView({ onClose }) {
  const [copiedItem, setCopiedItem] = useState(null);

  const phoneNumber = CREATOR_PROFILE.phoneNumber || "+229 01 99 72 83 85";
  const whatsappNumber = CREATOR_PROFILE.whatsappNumber || "2290199728385";
  const email = CREATOR_PROFILE.email || "mrbenofficiel6@gmail.com";

  const handleCopy = (text, type, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent("Bonjour Mr Ben, je vous contacte depuis votre site officiel.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:+${whatsappNumber}`, '_self');
  };

  const handleOpenEmail = () => {
    window.open(`mailto:${email}?subject=${encodeURIComponent("Contact Mr Ben - Échange Professionnel")}`, '_blank');
  };

  const handlePromoterWhatsApp = (e) => {
    if (e) e.stopPropagation();
    const text = encodeURIComponent("Bonjour Mr Ben, je souhaite devenir promoteur officiel et obtenir mon Code Promo personnel pour gagner 1 000 FCFA sur chaque vente.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handlePromoterEmail = (e) => {
    if (e) e.stopPropagation();
    const subject = encodeURIComponent("Demande de Code Promo Promoteur - Mr Ben");
    const body = encodeURIComponent("Bonjour Mr Ben,\n\nJe souhaite devenir promoteur officiel et obtenir mon propre Code Promo pour recommander vos formations et toucher 1 000 FCFA sur chaque vente.\n\nMerci !");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="contact-book-viewport">
      {/* CONTENEUR DU LIVRE D'ART (PAGE UNIQUE CONTACT) */}
      <div className="single-book-wrapper">
        {/* Épaisseur des feuillets sur la tranche du livre */}
        <div className="single-book-stack-edge left-stack" aria-hidden="true"></div>
        <div className="single-book-stack-edge right-stack" aria-hidden="true"></div>

        {/* LA GRANDE PAGE DE LIVRE IVOIRE / PAPIER D'ART NOBLE */}
        <div className="single-book-page-sheet">
          {/* Petite croix rouge épurée sans carte en haut à droite */}
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
            {/* En-tête : Devenir Promoteur & Gagner 1 000 FCFA avec les deux icônes cool WhatsApp & Gmail */}
            <div className="single-page-header promoter-contact-header">
              <div className="header-meta-row">
                <span className="contact-category-tag">🌟 Gagnez 1 000 FCFA / Vente</span>
              </div>
              <div className="promoter-banner-card">
                <div className="promoter-banner-text-side">
                  <h1 className="promoter-banner-title">Devenez Promoteur & Touchez Vos Commissions</h1>
                  <p className="promoter-banner-desc">
                    Recevez votre <strong>Code Promo officiel</strong> à partager. À chaque achat effectué avec votre code, vous encaissez immédiatement <strong>1 000 FCFA</strong>. Pour l'activer, écrivez-nous :
                  </p>
                </div>
                <div className="promoter-quick-icons">
                  <button 
                    type="button"
                    className="promoter-mini-icon-btn whatsapp-icon-btn"
                    onClick={handlePromoterWhatsApp}
                    title="Demander mon code promo sur WhatsApp"
                    aria-label="Contacter sur WhatsApp"
                  >
                    <MessageCircle size={19} />
                  </button>
                  <button 
                    type="button"
                    className="promoter-mini-icon-btn gmail-icon-btn"
                    onClick={handlePromoterEmail}
                    title="Demander mon code promo par Gmail"
                    aria-label="Contacter par Gmail"
                  >
                    <Mail size={19} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grille stylisée des 3 canaux aux formes arrondies et uniques */}
            <div className="contact-round-grid">
              {/* CANAL 1 : WHATSAPP (Capsule Organique Émeraude) */}
              <div 
                className="contact-round-card card-whatsapp-style"
                onClick={handleOpenWhatsApp}
              >
                <div className="round-card-header">
                  <div className="round-icon-circle circle-whatsapp">
                    <MessageCircle size={22} />
                  </div>
                  <span className="round-badge badge-whatsapp">Recommandé • Rapide</span>
                </div>

                <div className="round-card-content">
                  <h3 className="round-title">WhatsApp Officiel</h3>
                  <p className="round-coord">{phoneNumber}</p>
                  <p className="round-desc">
                    Idéal pour échanger instantanément, poser vos questions sur les formations ou valider un projet.
                  </p>
                </div>

                <div className="round-card-footer">
                  <button 
                    className="round-action-btn btn-whatsapp-pill"
                    onClick={(e) => { e.stopPropagation(); handleOpenWhatsApp(); }}
                  >
                    <span>Discuter</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button 
                    className="round-copy-pill"
                    onClick={(e) => handleCopy(phoneNumber, 'whatsapp', e)}
                    title="Copier le numéro"
                  >
                    {copiedItem === 'whatsapp' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedItem === 'whatsapp' ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* CANAL 2 : APPEL TÉLÉPHONIQUE (Médaillon Élégant Saphir) */}
              <div 
                className="contact-round-card card-phone-style"
                onClick={handleCall}
              >
                <div className="round-card-header">
                  <div className="round-icon-circle circle-phone">
                    <PhoneCall size={22} />
                  </div>
                  <span className="round-badge badge-phone">Ligne Directe</span>
                </div>

                <div className="round-card-content">
                  <h3 className="round-title">Appel Téléphonique</h3>
                  <p className="round-coord">{phoneNumber}</p>
                  <p className="round-desc">
                    Échange vocal direct pour vos demandes urgentes, partenariats ou questions spécifiques.
                  </p>
                </div>

                <div className="round-card-footer">
                  <button 
                    className="round-action-btn btn-phone-pill"
                    onClick={(e) => { e.stopPropagation(); handleCall(); }}
                  >
                    <span>Appeler</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button 
                    className="round-copy-pill"
                    onClick={(e) => handleCopy(phoneNumber, 'phone', e)}
                    title="Copier le numéro"
                  >
                    {copiedItem === 'phone' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedItem === 'phone' ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* CANAL 3 : GMAIL OFFICIEL (Galet Arrondi Rubis) */}
              <div 
                className="contact-round-card card-mail-style"
                onClick={handleOpenEmail}
              >
                <div className="round-card-header">
                  <div className="round-icon-circle circle-mail">
                    <Mail size={22} />
                  </div>
                  <span className="round-badge badge-mail">Courrier Pro</span>
                </div>

                <div className="round-card-content">
                  <h3 className="round-title">Adresse Gmail</h3>
                  <p className="round-coord email-coord">{email}</p>
                  <p className="round-desc">
                    Pour vos propositions formelles, envois de documents et correspondances officielles.
                  </p>
                </div>

                <div className="round-card-footer">
                  <button 
                    className="round-action-btn btn-mail-pill"
                    onClick={(e) => { e.stopPropagation(); handleOpenEmail(); }}
                  >
                    <span>Écrire</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button 
                    className="round-copy-pill"
                    onClick={(e) => handleCopy(email, 'email', e)}
                    title="Copier l'adresse email"
                  >
                    {copiedItem === 'email' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedItem === 'email' ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Note éditoriale signature de Mr Ben (validée par l'utilisateur) */}
            <div className="contact-editorial-seal">
              <div className="seal-author-box">
                <img src="/mr-logo.png" alt="Mr Ben" className="seal-logo-img" />
                <div>
                  <strong>Mr Ben</strong>
                  <span>Créateur, Storyteller & Concepteur Digital</span>
                </div>
              </div>
              <p className="seal-quote-text">
                « Chaque grand succès digital commence par une décision et un premier échange constructif. Que vous souhaitiez vous former, monétiser vos contenus ou faire décoller votre marque, vous bénéficiez de mon attention directe et de conseils concrets. »
              </p>
              <div className="seal-guarantees-row">
                <div className="guarantee-pill">
                  <Clock size={12} />
                  <span>Réponse assurée 7j/7</span>
                </div>
                <div className="guarantee-pill">
                  <Sparkles size={12} />
                  <span>Conseil personnalisé</span>
                </div>
                <div className="guarantee-pill">
                  <Globe size={12} />
                  <span>Bénin & International</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactBookView;
