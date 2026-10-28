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

  // Signatures reconnues des navigateurs intégrés (WebViews)
  const isFB = /FBAN|FBAV|FB_IAB|FB4A|Messenger/i.test(ua);
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
      const search = parsed.search || '';
      const hash = parsed.hash ? parsed.hash.replace('#', '') : '';
      
      // Si un hash existe (ex: #formations), on l'ajoute comme paramètre 'tab' pour éviter tout conflit de hash dans l'URI intent
      let queryWithTab = search;
      if (hash) {
        const sp = new URLSearchParams(search);
        if (!sp.has('tab')) {
          sp.set('tab', hash);
        }
        queryWithTab = '?' + sp.toString();
      }

      const intentUrl = `intent://${hostWithPath}${queryWithTab}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
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
