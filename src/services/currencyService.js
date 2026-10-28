// =============================================================================
// SERVICE MULTI-DEVISE & GÉOLOCALISATION PAR PAYS - MR BEN
// Détection automatique du pays du visiteur et affichage adapté des tarifs
// (FCFA UEMOA/CEMAC, GNF Guinée, EUR Europe, CAD Canada, USD International...)
// =============================================================================

export const SUPPORTED_COUNTRIES = {
  // Zone UEMOA (FCFA - XOF)
  'BJ': { code: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'CI': { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'SN': { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'TG': { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'BF': { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'ML': { code: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'NE': { code: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'GW': { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },

  // Zone CEMAC (FCFA - XAF parité 1:1)
  'CM': { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'GA': { code: 'GA', name: 'Gabon', flag: '🇬🇦', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'CG': { code: 'CG', name: 'Congo', flag: '🇨🇬', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'TD': { code: 'TD', name: 'Tchad', flag: '🇹🇩', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'CF': { code: 'CF', name: 'Centrafrique', flag: '🇨🇫', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },
  'GQ': { code: 'GQ', name: 'Guinée Équatoriale', flag: '🇬🇶', currency: 'FCFA', symbol: 'FCFA', shortSymbol: 'F', rateToXof: 1, type: 'cfa' },

  // Guinée Conakry (GNF)
  'GN': { code: 'GN', name: 'Guinée', flag: '🇬🇳', currency: 'GNF', symbol: 'GNF', shortSymbol: 'GNF', rateToXof: 14.1, type: 'gnf' },

  // France & Zone Euro
  'FR': { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', symbol: '€', shortSymbol: '€', rateToXof: 1 / 655.957, type: 'eur' },
  'BE': { code: 'BE', name: 'Belgique', flag: '🇧🇪', currency: 'EUR', symbol: '€', shortSymbol: '€', rateToXof: 1 / 655.957, type: 'eur' },
  'CH': { code: 'CH', name: 'Suisse', flag: '🇨🇭', currency: 'CHF', symbol: 'CHF', shortSymbol: 'CHF', rateToXof: 1 / 700, type: 'chf' },
  'DE': { code: 'DE', name: 'Allemagne', flag: '🇩🇪', currency: 'EUR', symbol: '€', shortSymbol: '€', rateToXof: 1 / 655.957, type: 'eur' },
  'ES': { code: 'ES', name: 'Espagne', flag: '🇪🇸', currency: 'EUR', symbol: '€', shortSymbol: '€', rateToXof: 1 / 655.957, type: 'eur' },
  'IT': { code: 'IT', name: 'Italie', flag: '🇮🇹', currency: 'EUR', symbol: '€', shortSymbol: '€', rateToXof: 1 / 655.957, type: 'eur' },

  // Canada & Amériques
  'CA': { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: '$ CAD', shortSymbol: '$', rateToXof: 1 / 440, type: 'cad' },
  'US': { code: 'US', name: 'États-Unis', flag: '🇺🇸', currency: 'USD', symbol: '$', shortSymbol: '$', rateToXof: 1 / 600, type: 'usd' },
  'CD': { code: 'CD', name: 'RD Congo', flag: '🇨🇩', currency: 'USD', symbol: '$', shortSymbol: '$', rateToXof: 1 / 600, type: 'usd' },

  // Maghreb
  'MA': { code: 'MA', name: 'Maroc', flag: '🇲🇦', currency: 'MAD', symbol: 'DH', shortSymbol: 'DH', rateToXof: 1 / 60, type: 'mad' },
  'DZ': { code: 'DZ', name: 'Algérie', flag: '🇩🇿', currency: 'DZD', symbol: 'DA', shortSymbol: 'DA', rateToXof: 1 / 4.5, type: 'dzd' },
  'TN': { code: 'TN', name: 'Tunisie', flag: '🇹🇳', currency: 'TND', symbol: 'DT', shortSymbol: 'DT', rateToXof: 1 / 195, type: 'tnd' },

  // Reste du Monde (défaut international)
  'INT': { code: 'INT', name: 'International', flag: '🌍', currency: 'USD', symbol: '$', shortSymbol: '$', rateToXof: 1 / 600, type: 'usd' }
};

const TIMEZONE_TO_COUNTRY_CODE = {
  'Africa/Porto-Novo': 'BJ',
  'Africa/Cotonou': 'BJ',
  'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN',
  'Africa/Lome': 'TG',
  'Africa/Douala': 'CM',
  'Africa/Ouagadougou': 'BF',
  'Africa/Bamako': 'ML',
  'Africa/Niamey': 'NE',
  'Africa/Libreville': 'GA',
  'Africa/Brazzaville': 'CG',
  'Africa/Kinshasa': 'CD',
  'Africa/Lubumbashi': 'CD',
  'Africa/Conakry': 'GN',
  'Africa/Ndjamena': 'TD',
  'Africa/Bangui': 'CF',
  'Africa/Malabo': 'GQ',
  'Europe/Paris': 'FR',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/London': 'US',
  'America/Montreal': 'CA',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ'
};

class CurrencyService {
  constructor() {
    this.currentCountryCode = this.initCountryCode();
    this.initAsyncGeoLookup();
  }

  initCountryCode() {
    // 1. Choix manuel sauvegardé
    try {
      const saved = localStorage.getItem('mrben_user_country_code');
      if (saved && SUPPORTED_COUNTRIES[saved]) {
        return saved;
      }
    } catch {}

    // 2. Détection par Fuseau horaire du navigateur
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TIMEZONE_TO_COUNTRY_CODE[tz]) {
        return TIMEZONE_TO_COUNTRY_CODE[tz];
      }
      // Si fuseau horaire commence par Europe/ -> France / EUR par défaut
      if (tz && tz.startsWith('Europe/')) return 'FR';
      // Si America/ -> Canada ou USA
      if (tz && (tz.includes('Montreal') || tz.includes('Toronto'))) return 'CA';
      if (tz && tz.startsWith('America/')) return 'US';
    } catch {}

    // 3. Cache de session analytics
    try {
      const geoRaw = sessionStorage.getItem('mrben_analytics_geo');
      if (geoRaw) {
        const parsed = JSON.parse(geoRaw);
        if (parsed?.code && SUPPORTED_COUNTRIES[parsed.code]) {
          return parsed.code;
        }
      }
    } catch {}

    // Défaut Bénin (berceau du projet)
    return 'BJ';
  }

  initAsyncGeoLookup() {
    if (typeof fetch === 'undefined') return;
    // Recherche IP discrète en arrière-plan sans ralentir le rendu
    setTimeout(() => {
      // Si l'utilisateur a choisi un pays manuellement, respecter son choix
      try {
        if (localStorage.getItem('mrben_user_country_code')) return;
      } catch {}

      fetch('https://api.country.is')
        .then(res => res.json())
        .then(data => {
          if (data && data.country) {
            const detectedCode = data.country.toUpperCase();
            if (SUPPORTED_COUNTRIES[detectedCode] && detectedCode !== this.currentCountryCode) {
              this.currentCountryCode = detectedCode;
              this.dispatchChange();
            }
          }
        })
        .catch(() => {});
    }, 400);
  }

  getCurrentCountry() {
    return SUPPORTED_COUNTRIES[this.currentCountryCode] || SUPPORTED_COUNTRIES['BJ'];
  }

  setCountry(countryCode) {
    const clean = (countryCode || '').toUpperCase();
    if (SUPPORTED_COUNTRIES[clean]) {
      this.currentCountryCode = clean;
      try {
        localStorage.setItem('mrben_user_country_code', clean);
      } catch {}
      this.dispatchChange();
    }
  }

  dispatchChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mrben_currency_changed', { 
        detail: this.getCurrentCountry() 
      }));
    }
  }

  // Conversion et formatage d'un montant XOF (FCFA) vers la monnaie du visiteur
  formatPrice(amountXof, { compact = false, countryCode = null } = {}) {
    const country = countryCode ? (SUPPORTED_COUNTRIES[countryCode] || this.getCurrentCountry()) : this.getCurrentCountry();
    const xof = Number(amountXof) || 0;

    switch (country.type) {
      case 'cfa':
        return compact 
          ? `${xof.toLocaleString('fr-FR')} ${country.shortSymbol}`
          : `${xof.toLocaleString('fr-FR')} ${country.symbol}`;

      case 'gnf': {
        // En Guinée, arrondi net aux milliers (ex: 2500 -> 35 000 GNF, 5000 -> 70 000 GNF)
        let gnf = Math.round((xof * 14.1) / 1000) * 1000;
        if (xof === 2500) gnf = 35000;
        if (xof === 3100) gnf = 44000;
        if (xof === 5000) gnf = 70000;
        if (xof === 6000) gnf = 85000;
        return `${gnf.toLocaleString('fr-FR')} GNF`;
      }

      case 'eur': {
        // Tarifs arrondis élégants pour la zone Euro (ex: 2 500 FCFA = 3,99 € ; 5 000 FCFA = 7,99 €)
        let eurStr = '';
        if (xof === 2500) eurStr = '3,99';
        else if (xof === 3100) eurStr = '4,99';
        else if (xof === 5000) eurStr = '7,99';
        else if (xof === 6000) eurStr = '9,99';
        else {
          const eurVal = Math.round((xof / 655.957) * 10) / 10;
          eurStr = eurVal.toFixed(2).replace('.', ',');
        }
        return `${eurStr} €`;
      }

      case 'cad': {
        let cadStr = '';
        if (xof === 2500) cadStr = '5,99';
        else if (xof === 3100) cadStr = '6,99';
        else if (xof === 5000) cadStr = '11,99';
        else if (xof === 6000) cadStr = '13,99';
        else {
          const val = Math.round((xof / 440) * 10) / 10;
          cadStr = val.toFixed(2).replace('.', ',');
        }
        return compact ? `${cadStr} $` : `${cadStr} $ CAD`;
      }

      case 'usd': {
        let usdStr = '';
        if (xof === 2500) usdStr = '4.50';
        else if (xof === 3100) usdStr = '5.50';
        else if (xof === 5000) usdStr = '8.99';
        else if (xof === 6000) usdStr = '10.99';
        else {
          const val = Math.round((xof / 600) * 10) / 10;
          usdStr = val.toFixed(2);
        }
        return compact ? `$${usdStr}` : `${usdStr} $`;
      }

      case 'mad': {
        let mad = Math.round(xof / 60);
        if (xof === 2500) mad = 40;
        if (xof === 3100) mad = 50;
        if (xof === 5000) mad = 80;
        if (xof === 6000) mad = 100;
        return `${mad} DH`;
      }

      default: {
        const val = (Math.round((xof / 600) * 10) / 10).toFixed(2);
        return `${val} $`;
      }
    }
  }

  // Renvoie un objet complet avec le prix de vente et le prix barré pré-formatés
  formatPricePair(currentXof, originalXof, { compact = false, countryCode = null } = {}) {
    const country = countryCode ? (SUPPORTED_COUNTRIES[countryCode] || this.getCurrentCountry()) : this.getCurrentCountry();
    const currXof = Math.max(0, Number(currentXof) || 0);
    // Si originalXof n'est pas spécifié ou inférieur à currXof, calculer un grand prix naturel (ex: ~x2)
    const origXof = (originalXof && Number(originalXof) > currXof) 
      ? Number(originalXof) 
      : (currXof === 2500 ? 5000 : currXof === 3100 ? 6000 : Math.round(currXof * 2));

    const currentFormatted = this.formatPrice(currXof, { compact, countryCode: country.code });
    const originalFormatted = this.formatPrice(origXof, { compact, countryCode: country.code });

    return {
      country,
      isCFA: country.type === 'cfa',
      currency: country.currency,
      symbol: country.symbol,
      currentFormatted,
      originalFormatted,
      currentXof: currXof,
      originalXof: origXof,
      equivalentNote: country.type !== 'cfa' ? `(soit ${currXof.toLocaleString('fr-FR')} FCFA)` : ''
    };
  }
}

export const currencyService = new CurrencyService();
