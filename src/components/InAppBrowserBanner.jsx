import React, { useState, useEffect } from 'react';
import { Globe, ExternalLink, Compass, ArrowRight } from 'lucide-react';
import { detectInAppBrowser, openInExternalBrowser } from '../utils/inAppBrowser';
import './InAppBrowserBanner.css';

export function InAppBrowserBanner({ onBypass }) {
  const [browserInfo, setBrowserInfo] = useState(() => detectInAppBrowser());
  const [isBypassed, setIsBypassed] = useState(false);

  useEffect(() => {
    const info = detectInAppBrowser();
    setBrowserInfo(info);

    // Sur Android : tentative immédiate de bascule vers Chrome
    if (info.isAndroid && info.isInApp && !isBypassed) {
      const timer = setTimeout(() => {
        openInExternalBrowser();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isBypassed]);

  if (!browserInfo.isInApp || isBypassed) {
    return null;
  }

  const handleLaunchExternal = () => {
    openInExternalBrowser();
  };

  const handleBypass = () => {
    try {
      sessionStorage.setItem('mrben_skip_inapp_guard', 'true');
    } catch {}
    setIsBypassed(true);
    if (onBypass) onBypass();
  };

  return (
    <div className="in-app-fullscreen-screen" role="dialog" aria-modal="true">
      <div className="in-app-redirect-container">
        {/* Logo Mr Ben officiel */}
        <div className="in-app-brand-logo">
          <span>MB</span>
        </div>

        <div className="in-app-app-badge">
          <span>{browserInfo.appName}</span>
        </div>

        <h1 className="in-app-redirect-title">
          Ouverture dans votre navigateur...
        </h1>

        <p className="in-app-redirect-desc">
          Pour vous garantir une <strong>expérience 100% fluide</strong> et accéder facilement à vos formations, cette page s'ouvre dans votre navigateur par défaut.
        </p>

        {browserInfo.isIOS ? (
          <div className="in-app-ios-guide-box">
            <div className="ios-guide-step">
              <span className="ios-step-number">1</span>
              <span>Touchez les <strong className="ios-dots-pill">⋯</strong> en haut à droite de l'écran</span>
            </div>
            <div className="ios-guide-step">
              <span className="ios-step-number">2</span>
              <span>Sélectionnez <strong>« Ouvrir dans Safari »</strong></span>
            </div>
          </div>
        ) : (
          <>
            <button 
              type="button" 
              className="btn-launch-external-browser"
              onClick={handleLaunchExternal}
            >
              <Globe size={18} />
              <span>Ouvrir dans Google Chrome</span>
              <ArrowRight size={16} />
            </button>

            <div className="in-app-progress-wrapper" aria-hidden="true">
              <div className="in-app-progress-bar"></div>
            </div>
          </>
        )}

        <button 
          type="button" 
          className="btn-bypass-inapp"
          onClick={handleBypass}
        >
          Continuer quand même dans cette vue
        </button>
      </div>
    </div>
  );
}
