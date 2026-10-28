import React, { useState, useEffect } from 'react';
import { Globe, ExternalLink, X, Compass } from 'lucide-react';
import { detectInAppBrowser, openInExternalBrowser } from '../utils/inAppBrowser';
import './InAppBrowserBanner.css';

export function InAppBrowserBanner() {
  const [browserInfo, setBrowserInfo] = useState(() => detectInAppBrowser());
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('mrben_inapp_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const info = detectInAppBrowser();
    setBrowserInfo(info);

    // Sur Android dans un navigateur intégré : tentative automatique d'ouverture dans le vrai Chrome
    if (info.isAndroid && info.isInApp && !isDismissed) {
      try {
        const attempted = sessionStorage.getItem('mrben_auto_breakout_attempted');
        if (!attempted) {
          sessionStorage.setItem('mrben_auto_breakout_attempted', 'true');
          const timer = setTimeout(() => {
            openInExternalBrowser();
          }, 350);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [isDismissed]);

  if (!browserInfo.isInApp || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('mrben_inapp_dismissed', 'true');
    } catch {}
  };

  const handleOpenExternal = () => {
    openInExternalBrowser();
  };

  return (
    <aside className="in-app-browser-banner" aria-label="Notification d'ouverture externe">
      <div className="in-app-banner-content">
        <div className="in-app-banner-left">
          <div className="in-app-banner-icon">
            {browserInfo.isIOS ? <Compass size={18} /> : <Globe size={18} />}
          </div>

          <div className="in-app-banner-text">
            <div className="in-app-banner-title">
              <span>{browserInfo.appName}</span>
              <span className="in-app-banner-badge">Navigateur Réseau</span>
            </div>

            <div className="in-app-banner-desc">
              {browserInfo.isIOS ? (
                <span>
                  Pour une lecture fluide sans blocage : touchez les <strong className="ios-step-indicator">⋯</strong> en haut à droite puis <strong className="ios-step-indicator">« Ouvrir dans Safari »</strong> <span className="pulse-arrow">↗</span>
                </span>
              ) : (
                <span>
                  Pour un défilement ultra-fluide et sans blocage, ouvrez l'application dans <strong>Google Chrome</strong>.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="in-app-banner-actions">
          {browserInfo.isAndroid && (
            <button 
              type="button" 
              className="btn-in-app-external"
              onClick={handleOpenExternal}
              title="Ouvrir directement dans Google Chrome ou votre navigateur par défaut"
            >
              <ExternalLink size={14} />
              <span>Ouvrir dans Chrome</span>
            </button>
          )}

          <button 
            type="button" 
            className="btn-in-app-close" 
            onClick={handleDismiss}
            aria-label="Fermer la notice"
            title="Continuer ici"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
