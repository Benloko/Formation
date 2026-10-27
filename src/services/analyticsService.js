// =============================================================================
// SERVICE ANALYTICS ET STATISTIQUES EN DIRECT - MR BEN
// Moteur de suivi 100% interne, ultra-léger, respectueux de la vie privée
// =============================================================================

const API_BASE = '/api/index.php';

// Correspondance des fuseaux horaires africains & francophones vers les pays
const TIMEZONE_TO_COUNTRY = {
  'Africa/Porto-Novo': { country: 'Bénin', code: 'BJ' },
  'Africa/Cotonou': { country: 'Bénin', code: 'BJ' },
  'Africa/Abidjan': { country: "Côte d'Ivoire", code: 'CI' },
  'Africa/Dakar': { country: 'Sénégal', code: 'SN' },
  'Africa/Lome': { country: 'Togo', code: 'TG' },
  'Africa/Douala': { country: 'Cameroun', code: 'CM' },
  'Africa/Ouagadougou': { country: 'Burkina Faso', code: 'BF' },
  'Africa/Bamako': { country: 'Mali', code: 'ML' },
  'Africa/Niamey': { country: 'Niger', code: 'NE' },
  'Africa/Libreville': { country: 'Gabon', code: 'GA' },
  'Africa/Brazzaville': { country: 'Congo', code: 'CG' },
  'Africa/Kinshasa': { country: 'RD Congo', code: 'CD' },
  'Africa/Conakry': { country: 'Guinée', code: 'GN' },
  'Africa/Ndjamena': { country: 'Tchad', code: 'TD' },
  'Europe/Paris': { country: 'France', code: 'FR' },
  'Europe/Brussels': { country: 'Belgique', code: 'BE' },
  'America/Montreal': { country: 'Canada', code: 'CA' },
  'America/Toronto': { country: 'Canada', code: 'CA' },
  'America/New_York': { country: 'États-Unis', code: 'US' },
  'Africa/Casablanca': { country: 'Maroc', code: 'MA' },
  'Africa/Tunis': { country: 'Tunisie', code: 'TN' },
  'Africa/Algiers': { country: 'Algérie', code: 'DZ' }
};

class AnalyticsService {
  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.geo = this.detectGeo();
    this.device = this.detectDevice();
    this.lastRecorded = {};
  }

  getOrCreateVisitorId() {
    try {
      let vid = localStorage.getItem('mrben_analytics_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('mrben_analytics_vid', vid);
      }
      return vid;
    } catch {
      return 'v_anon_' + Math.random().toString(36).substring(2, 10);
    }
  }

  getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem('mrben_analytics_sid');
      if (!sid) {
        sid = 's_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('mrben_analytics_sid', sid);
      }
      return sid;
    } catch {
      return 's_anon';
    }
  }

  detectDevice() {
    const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
    let deviceType = 'Ordinateur';
    let os = 'Autre';
    let browser = 'Chrome';

    // Type d'appareil
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (typeof window !== 'undefined' && window.innerWidth <= 768)) {
      deviceType = 'Mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
      deviceType = 'Tablette';
    }

    // Système d'exploitation
    if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    // Navigateur
    if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Browser';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';

    return { deviceType, os, browser };
  }

  detectGeo() {
    try {
      const cached = sessionStorage.getItem('mrben_analytics_geo');
      if (cached) return JSON.parse(cached);
    } catch {}

    let geo = { country: 'Bénin', code: 'BJ' };
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TIMEZONE_TO_COUNTRY[tz]) {
        geo = TIMEZONE_TO_COUNTRY[tz];
      }
    } catch {}

    // Tentative de géolocalisation IP légère en arrière-plan (sans bloquer)
    if (typeof fetch !== 'undefined') {
      setTimeout(() => {
        fetch('https://api.country.is')
          .then(res => res.json())
          .then(data => {
            if (data && data.country) {
              const code = data.country.toUpperCase();
              const mapNames = {
                'BJ': 'Bénin', 'CI': "Côte d'Ivoire", 'SN': 'Sénégal', 'TG': 'Togo',
                'CM': 'Cameroun', 'FR': 'France', 'BF': 'Burkina Faso', 'ML': 'Mali',
                'NE': 'Niger', 'GA': 'Gabon', 'CG': 'Congo', 'CD': 'RD Congo',
                'GN': 'Guinée', 'BE': 'Belgique', 'CA': 'Canada', 'US': 'États-Unis'
              };
              const country = mapNames[code] || code;
              this.geo = { country, code };
              try { sessionStorage.setItem('mrben_analytics_geo', JSON.stringify(this.geo)); } catch {}
            }
          })
          .catch(() => {});
      }, 500);
    }

    return geo;
  }

  // Envoi d'un événement au serveur en tâche de fond (ultra-léger, sans ralentir)
  async record({ page = '/', eventType = 'page_view', formationViewed = '', promoCode = '' }) {
    try {
      const key = `${eventType}_${formationViewed}_${page}`;
      const now = Date.now();
      if (this.lastRecorded[key] && now - this.lastRecorded[key] < 5000) {
        return; // Évite les doublons sur clic répété
      }
      this.lastRecorded[key] = now;

      // Récupérer le code promo depuis l'URL si présent
      if (!promoCode && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
        promoCode = urlParams.get('promo') || urlParams.get('code') || '';
      }

      const payload = {
        action: 'record_visit',
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        page: page || (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/'),
        eventType,
        formationViewed,
        promoCode: promoCode ? promoCode.toUpperCase() : '',
        country: this.geo.country || 'Bénin',
        countryCode: this.geo.code || 'BJ',
        deviceType: this.device.deviceType,
        os: this.device.os,
        browser: this.device.browser
      };

      const jsonStr = JSON.stringify(payload);

      // 1. sendBeacon pour fiabilité absolue même si la page est quittée
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        navigator.sendBeacon(API_BASE, blob);
        return;
      }

      // 2. Fallback fetch en tâche de fond
      fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr,
        keepalive: true
      }).catch(() => {});
    } catch (e) {
      // Échec silencieux pour ne jamais impacter l'expérience élève
    }
  }

  // Raccourcis pour les événements clés
  trackPageView(page = '/', formationViewed = '') {
    this.record({ page, eventType: 'page_view', formationViewed });
  }

  // Suivi spécifique par bouton
  trackButtonClick(buttonId, formationId = '', page = '') {
    this.record({
      eventType: buttonId,
      formationViewed: formationId,
      page: page || (typeof window !== 'undefined' ? window.location.pathname + (window.location.hash || '') : '/')
    });
  }

  trackFormationView(formationId) {
    this.record({ eventType: 'formation_view', formationViewed: formationId });
  }

  trackUnlockClick(formationId) {
    const btnId = formationId === 'livre-bd-storytelling' ? 'btn_unlock_bd' : (formationId === 'livre-videos-ia' ? 'btn_unlock_videos' : 'btn_unlock');
    this.record({ eventType: btnId, formationViewed: formationId });
  }

  trackWhatsAppClick(context = 'contact') {
    const btnId = context === 'livre-bd-storytelling' ? 'btn_whatsapp_bd' : (context === 'livre-videos-ia' ? 'btn_whatsapp_videos' : 'btn_whatsapp_contact');
    this.record({ eventType: btnId, formationViewed: context });
  }

  trackDemoRead(formationId) {
    const btnId = formationId === 'livre-bd-storytelling' ? 'btn_demo_bd' : (formationId === 'livre-videos-ia' ? 'btn_demo_videos' : 'btn_demo');
    this.record({ eventType: btnId, formationViewed: formationId });
  }

  // Récupérer les données pour l'espace Admin
  async fetchAnalytics(period = '7d') {
    try {
      const res = await fetch(`${API_BASE}?action=get_analytics&period=${period}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Erreur chargement analytics:", err);
      return {
        success: false,
        kpis: { totalViews: 0, uniqueVisitors: 0, totalInteractions: 0, unlockClicks: 0, whatsappClicks: 0, demoReads: 0 },
        chartData: [],
        topCountries: [],
        devices: [],
        formations: [],
        recentVisits: []
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
