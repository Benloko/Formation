/**
 * Utilitaire de détection et de déblocage des navigateurs intégrés aux réseaux sociaux
 * (Facebook, Instagram, TikTok, Snapchat, Twitter/X, Messenger, LinkedIn, etc.)
 */

export function detectInAppBrowser() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isInApp: false,
      isAndroid: false,
      isIOS: false,
      appName: 'Navigateur',
      originalUrl: ''
    };
  }

  const ua = navigator.userAgent || navigator.vendor || (window.opera ? window.opera.toString() : '');
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // Vérification si l'utilisateur a forcé la vue interne
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mrben_skip_inapp_guard') === 'true') {
    return {
      isInApp: false,
      isAndroid,
      isIOS,
      appName: 'Navigateur',
      originalUrl: window.location.href
    };
  }

  // Signatures reconnues des navigateurs intégrés (WebViews & Facebook Lite)
  const isFB = /FBAN|FBAV|FB_IAB|FB4A|Messenger|FBLC|FBLite|Facebook/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isTikTok = /musical_ly|Bytedance|TikTok/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);
  const isTwitter = /Twitter/i.test(ua);
  const isLinkedIn = /LinkedInApp/i.test(ua);
  const isLine = /Line\//i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);
  const isGenericWebView = /wv|WebView/i.test(ua) || (isAndroid && /Version\/[0-9.]+/i.test(ua) && /Chrome\/[0-9.]+/i.test(ua));

  const isInApp = isFB || isInstagram || isTikTok || isSnapchat || isTwitter || isLinkedIn || isLine || isWeChat || isGenericWebView;

  let appName = 'Réseau social';
  if (isFB) appName = 'Facebook';
  else if (isInstagram) appName = 'Instagram';
  else if (isTikTok) appName = 'TikTok';
  else if (isSnapchat) appName = 'Snapchat';
  else if (isTwitter) appName = 'Twitter / X';
  else if (isLinkedIn) appName = 'LinkedIn';
  else if (isWeChat) appName = 'WeChat';

  return {
    isInApp,
    isAndroid,
    isIOS,
    appName,
    originalUrl: window.location.href
  };
}

/**
 * Force l'ouverture du lien dans le vrai navigateur du téléphone (Google Chrome / Navigateur par défaut sur Android)
 */
export function openInExternalBrowser(customUrl) {
  if (typeof window === 'undefined') return;

  const currentUrl = customUrl || window.location.href;
  const isAndroid = /android/i.test(navigator.userAgent);

  if (isAndroid) {
    // Protocole officiel Android Intent : ordonne à Android d'ouvrir le navigateur système par défaut
    // On extrait l'hôte, le chemin et la query string
    try {
      const parsed = new URL(currentUrl);
      const hostWithPath = parsed.host + parsed.pathname;
      const sp = new URLSearchParams(parsed.search || '');
      const rawHash = parsed.hash || '';

      if (rawHash.includes('?')) {
        const hashParts = rawHash.split('?');
        const hashTab = hashParts[0].replace('#', '');
        if (hashTab && !sp.has('tab')) sp.set('tab', hashTab);
        const hashParams = new URLSearchParams(hashParts[1]);
        hashParams.forEach((val, key) => {
          if (!sp.has(key)) sp.set(key, val);
        });
      } else if (rawHash) {
        const cleanTab = rawHash.replace('#', '');
        if (cleanTab && !sp.has('tab')) sp.set('tab', cleanTab);
      }

      // Si code promo présent, rediriger directement vers la vue formations
      if ((sp.has('promo') || sp.has('code')) && !sp.has('tab')) {
        sp.set('tab', 'formations');
      }

      const queryString = sp.toString() ? ('?' + sp.toString()) : '';
      const intentUrl = `intent://${hostWithPath}${queryString}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
      window.location.href = intentUrl;
      return true;
    } catch {
      const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
      window.location.href = intentUrl;
      return true;
    }
  } else {
    // Sur iOS, les WebViews bloquent les redirections silencieuses vers Safari.
    // window.open vers le lien permet dans certains cas de proposer l'ouverture externe
    try {
      window.open(currentUrl, '_system');
    } catch {}
    return false;
  }
}
