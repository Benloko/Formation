import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './ServicesSection.css';
import { SERVICES_DATA, CREATOR_PROFILE } from '../data/servicesData';

export function ServicesSection() {
  const handleContactService = (service) => {
    const text = encodeURIComponent(service.whatsappMessage);
    window.open(`https://wa.me/${CREATOR_PROFILE.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="services-section">
      <div className="services-header">
        <span className="badge-tag">Accompagnement & Solutions</span>
        <h2 className="services-title">Services Professionnels Mr Ben</h2>
        <p className="services-desc">
          Solutions concrètes pour lancer et monétiser vos projets digitaux sans perdre de temps.
        </p>
      </div>

      {/* Liste sobre en lignes épurées (Aucune carte encombrante) */}
      <div className="services-clean-list">
        {SERVICES_DATA.map((service) => (
          <div 
            key={service.id} 
            className="service-clean-line"
            onClick={() => handleContactService(service)}
          >
            <div className="service-info-group">
              <div className="service-name-row">
                <span className="service-name">{service.title}</span>
                <span className="service-mini-tag">{service.tag}</span>
              </div>
              <p className="service-note">{service.shortDesc}</p>
            </div>

            <div className="service-action-link">
              <span>Commander</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
