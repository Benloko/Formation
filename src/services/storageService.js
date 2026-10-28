// Gestion des codes d'accès, commandes et statistiques locales (compatible intégration backend / Supabase)

const STORAGE_KEYS = {
  UNLOCKED_CODES: "mrben_unlocked_codes",
  ORDERS: "mrben_orders_list",
  ACTIVE_USER: "mrben_current_user",
  ADMIN_CODES: "mrben_admin_generated_codes",
  FORMATION_PRICES: "mrben_formation_prices",
  PROMOTERS: "mrben_promoters_list",
  PENDING_PROMO: "mrben_pending_promo_code"
};

const DEFAULT_PRICES = {
  "livre-bd-storytelling": 2500,
  "livre-videos-ia": 3100
};

// Codes promo officiels reconnus universellement sur tous les appareils
const DEFAULT_PROMOTERS = [
  {
    id: "prom_ben200",
    nom: "LOKO",
    prenom: "Mr Ben",
    codePromo: "BEN200",
    whatsapp: "2290199728385",
    targetBookId: "all",
    reductionPct: 20,
    commissionPct: 50,
    status: "ACTIF",
    salesCount: 0,
    totalEarned: 0,
    salesHistory: [],
    createdAt: "21/10/2026, 14:00"
  }
];

// Zéro commande de test par défaut : données réelles uniquement
const DEFAULT_ORDERS = [];

// Remise à zéro complète demandée par l'utilisateur ("Il n'y aura aucun compte de test ou autres")
(function autoWipeOnUserRequest() {
  try {
    const WIPE_KEY = "mrben_clean_slate_no_test_accounts_v8";
    if (localStorage.getItem(WIPE_KEY) !== "true") {
      localStorage.removeItem("mrben_google_accounts");
      localStorage.removeItem("mrben_logged_in_gmail");
      localStorage.removeItem("mrben_pending_verification");
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.setItem(WIPE_KEY, "true");
    }
  } catch {}
})();

// Si aucun compte Google n'est connecté sur cet appareil, purger immédiatement les codes débloqués
(function purgeUnlockedIfLoggedOut() {
  try {
    const current = localStorage.getItem("mrben_logged_in_gmail");
    if (!current) {
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
    }
  } catch {}
})();

// Purge immédiate de tout code promo fantôme bloqué dans localStorage si l'URL ne contient aucun lien promo
(function purgeGhostPromoCode() {
  try {
    if (typeof window !== 'undefined') {
      const hasPromoInUrl = (
        (window.location.search && window.location.search.includes('promo=')) ||
        (window.location.hash && window.location.hash.includes('promo='))
      );
      if (!hasPromoInUrl) {
        localStorage.removeItem(STORAGE_KEYS.PENDING_PROMO);
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_PROMO);
      }
    }
  } catch {}
})();

// Base d'accès API Hostinger (avec fallback transparent sur le domaine officiel en local)
const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'https://formation.gpower-store.com/api'
  : '/api';

const apiRequest = async (action, data = null, method = 'POST') => {
  if (typeof window === 'undefined') return null;
  try {
    const url = method === 'GET' 
      ? `${API_BASE}/?action=${encodeURIComponent(action)}${data ? '&' + new URLSearchParams(data).toString() : ''}`
      : `${API_BASE}/?action=${encodeURIComponent(action)}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (method === 'POST' && data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const storageService = {
  // Synchronisation avec la base de données cloud Hostinger
  // Synchronisation bidirectionnelle avec la base de données cloud Hostinger
  initCloudSync: async () => {
    try {
      const email = storageService.getLoggedInGmail();
      const res = await apiRequest('get_all', email ? { email } : {}, 'GET');
      if (res && res.success) {
        if (Array.isArray(res.promoters) && res.promoters.length > 0) {
          const local = storageService.getAllPromoters();
          const map = new Map();
          local.forEach(l => {
            const key = (l.codePromo || '').trim().toUpperCase();
            if (key) map.set(key, l);
          });
          res.promoters.forEach(r => {
            const key = (r.codePromo || '').trim().toUpperCase();
            if (key) {
              const existing = map.get(key) || {};
              const mergedPassword = (r.password && r.password.trim()) ? r.password.trim() : (existing.password || '');
              const mergedEmail = (r.email && r.email.trim()) ? r.email.trim().toLowerCase() : (existing.email || '');
              const mergedPayoutPhone = (r.payoutPhone || r.payout_phone || '').trim() || (existing.payoutPhone || existing.whatsapp || '');
              const mergedPasswordSetAt = r.passwordSetAt || r.password_set_at || existing.passwordSetAt || null;
              map.set(key, { 
                ...existing, 
                ...r, 
                password: mergedPassword, 
                email: mergedEmail, 
                payoutPhone: mergedPayoutPhone,
                passwordSetAt: mergedPasswordSetAt
              });
            }
          });
          DEFAULT_PROMOTERS.forEach(d => {
            const key = d.codePromo.toUpperCase();
            if (!map.has(key)) map.set(key, d);
          });
          localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(Array.from(map.values())));
        }
        if (Array.isArray(res.adminCodes)) {
          const localCodes = storageService.getAdminGeneratedCodes();
          const mapCodes = new Map();
          localCodes.forEach(lc => mapCodes.set(lc.code, lc));
          res.adminCodes.forEach(rc => mapCodes.set(rc.code, { ...(mapCodes.get(rc.code) || {}), ...rc }));
          localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(Array.from(mapCodes.values())));
        }
        if (Array.isArray(res.orders)) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(res.orders));
        }
        if (res.prices) {
          localStorage.setItem(STORAGE_KEYS.FORMATION_PRICES, JSON.stringify(res.prices));
        }
        if (email && Array.isArray(res.unlocked) && res.unlocked.length > 0) {
          const currentUnlocked = storageService.getUnlockedCodes();
          res.unlocked.forEach(bookId => {
            if (!currentUnlocked.some(u => u.itemId === bookId)) {
              currentUnlocked.push({
                itemId: bookId,
                code: 'CLOUD_UNLOCKED',
                itemTitle: bookId === 'livre-bd-storytelling' ? "L'Art du Storytelling & BD" : "Création de Vidéos Virales avec l'IA",
                userEmail: email,
                unlockedAt: new Date().toISOString()
              });
            }
          });
          localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(currentUnlocked));
        }
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
  },

  // Déblocage avec vérification cloud instantanée pour les codes créés sur un autre appareil
  unlockWithCodeAsync: async (inputCode, currentBookId, userEmail) => {
    // 1. Essai de validation locale rapide
    const localRes = storageService.unlockWithCode(inputCode, currentBookId, userEmail);
    if (localRes.success) {
      return localRes;
    }

    // 2. Si le code n'est pas encore synchronisé localement, interroger directement le cloud Hostinger
    try {
      const cleanCode = (inputCode || '').trim().toUpperCase();
      const cleanEmail = (userEmail || storageService.getLoggedInGmail() || '').trim().toLowerCase();

      const apiRes = await apiRequest('redeem_admin_code', {
        code: cleanCode,
        email: cleanEmail,
        bookId: currentBookId
      });

      if (apiRes && apiRes.success) {
        const unlocked = storageService.getUnlockedCodes();
        if (!unlocked.some(u => u.code === cleanCode)) {
          unlocked.push({
            code: cleanCode,
            itemId: apiRes.bookId || currentBookId,
            itemTitle: apiRes.bookTitle || '',
            userEmail: cleanEmail,
            unlockedAt: new Date().toISOString()
          });
          localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));
        }

        // Synchroniser tous les codes en local
        await storageService.initCloudSync();

        return {
          success: true,
          order: apiRes.order || {
            itemId: apiRes.bookId || currentBookId,
            itemTitle: apiRes.bookTitle || '',
            code: cleanCode
          }
        };
      } else if (apiRes && apiRes.message) {
        return { success: false, message: apiRes.message };
      }
    } catch {}

    return localRes;
  },

  // Déconnexion complète : purge l'e-mail connecté, les codes en cache et la session
  logout: () => {
    try {
      localStorage.removeItem("mrben_logged_in_gmail");
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
      storageService.clearPendingPromoCode();
      sessionStorage.removeItem("mrben_reader_page_livre-bd-storytelling");
      sessionStorage.removeItem("mrben_reader_page_livre-videos-ia");
      return true;
    } catch {
      return false;
    }
  },

  // Réinitialiser manuellement toutes les données
  resetAllAccounts: () => {
    try {
      localStorage.removeItem("mrben_google_accounts");
      localStorage.removeItem("mrben_logged_in_gmail");
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      storageService.clearPendingPromoCode();
      return true;
    } catch {
      return false;
    }
  },

  // Récupérer les codes débloqués sur cet appareil
  getUnlockedCodes: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNLOCKED_CODES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  // Vérifier si un livre spécifique est débloqué pour ce visiteur
  isBookUnlocked: (bookId) => {
    try {
      const email = storageService.getLoggedInGmail();
      // RÈGLE DE SÉCURITÉ : Si l'utilisateur est déconnecté, AUCUN livre n'est débloqué !
      if (!email) {
        return false;
      }

      const cleanEmail = email.trim().toLowerCase();

      // Liste des codes admin révoqués / bloqués
      const adminCodes = storageService.getAdminGeneratedCodes();
      const blockedCodesList = new Set(
        adminCodes.filter(c => c.status === "BLOQUÉ").map(c => c.code)
      );

      // 1. Vérifier si une commande officielle (achat ou duo) est associée à ce compte Google
      const orders = storageService.getAllOrders();
      const hasOrder = orders.some(o => 
        o.clientEmail && 
        o.clientEmail.toLowerCase() === cleanEmail && 
        (o.itemId === bookId || o.itemId === "pack-duo-mr-ben") &&
        o.status !== "BLOQUÉ" &&
        (!o.code || !blockedCodesList.has(o.code))
      );
      if (hasOrder) return true;

      // 2. Vérifier si un code admin à usage unique actif a été activé par ce compte
      const hasAdminCode = adminCodes.some(c => 
        c.status === "UTILISÉ" && 
        c.usedBy && 
        c.usedBy.toLowerCase() === cleanEmail && 
        (c.itemId === bookId || c.itemId === "pack-duo-mr-ben")
      );
      if (hasAdminCode) return true;

      // 3. Vérifier dans la liste des codes débloqués rattachés strictement à cet e-mail
      const codes = storageService.getUnlockedCodes();
      return codes.some(c => 
        (c.itemId === bookId || c.itemId === "pack-duo-mr-ben") &&
        c.userEmail && c.userEmail.toLowerCase() === cleanEmail &&
        (!c.code || !blockedCodesList.has(c.code))
      );
    } catch {
      return false;
    }
  },

  // Récupérer le Gmail actuellement connecté sur cet appareil
  getLoggedInGmail: () => {
    try {
      return localStorage.getItem("mrben_logged_in_gmail") || "";
    } catch {
      return "";
    }
  },

  setLoggedInGmail: (email) => {
    try {
      const current = localStorage.getItem("mrben_logged_in_gmail") || "";
      const next = (email || '').trim().toLowerCase();
      // Si on change de compte ou qu'on se déconnecte, purger immédiatement les codes en cache
      if (current !== next) {
        localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
      }
      if (next) {
        localStorage.setItem("mrben_logged_in_gmail", next);
      } else {
        localStorage.removeItem("mrben_logged_in_gmail");
      }
    } catch {
      // Ignore
    }
  },

  // Récupérer la liste des comptes Google enregistrés et vérifiés sur cet appareil
  getGoogleAccounts: () => {
    try {
      const saved = localStorage.getItem("mrben_google_accounts");
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  },

  // Ajouter / enregistrer un compte Google vérifié
  addGoogleAccount: (email, name) => {
    try {
      const accounts = storageService.getGoogleAccounts();
      const cleanEmail = email.trim().toLowerCase();
      const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
      if (!existing) {
        accounts.push({
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          avatar: cleanEmail[0].toUpperCase(),
          verifiedAt: new Date().toISOString()
        });
        localStorage.setItem("mrben_google_accounts", JSON.stringify(accounts));
      }
      storageService.setLoggedInGmail(cleanEmail);
      return accounts;
    } catch {
      return [];
    }
  },

  // Supprimer un compte de la liste sur cet appareil
  removeGoogleAccount: (email) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let accounts = storageService.getGoogleAccounts();
      accounts = accounts.filter(a => a.email.toLowerCase() !== cleanEmail);
      localStorage.setItem("mrben_google_accounts", JSON.stringify(accounts));
      if (storageService.getLoggedInGmail() === cleanEmail) {
        if (accounts.length > 0) {
          storageService.setLoggedInGmail(accounts[0].email);
        } else {
          storageService.setLoggedInGmail("");
        }
      }
      return accounts;
    } catch {
      return [];
    }
  },

  // Générer et envoyer un code de confirmation à 6 chiffres par Gmail
  sendGmailVerificationCode: (email) => {
    const cleanEmail = email.trim().toLowerCase();
    // Génère un code aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationData = {
      email: cleanEmail,
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000 // Valide 15 minutes
    };
    try {
      localStorage.setItem("mrben_pending_verification", JSON.stringify(verificationData));
    } catch {}
    return { success: true, email: cleanEmail, code };
  },

  // Valider le code à 6 chiffres saisi par l'utilisateur
  verifyGmailCode: (email, inputCode) => {
    try {
      const saved = localStorage.getItem("mrben_pending_verification");
      if (!saved) {
        return { success: false, message: "Aucun code en attente. Veuillez cliquer sur Renvoyer le code." };
      }
      const data = JSON.parse(saved);
      const cleanEmail = email.trim().toLowerCase();
      if (data.email !== cleanEmail) {
        return { success: false, message: "L'adresse e-mail a changé. Veuillez demander un nouveau code." };
      }
      if (Date.now() > data.expiresAt) {
        return { success: false, message: "Ce code a expiré (délai de 15 minutes dépassé). Veuillez en demander un nouveau." };
      }
      if (data.code.trim() !== inputCode.trim()) {
        return { success: false, message: "Code de confirmation incorrect. Vérifiez les 6 chiffres reçus." };
      }
      // Succès : le compte est certifié et ajouté
      storageService.addGoogleAccount(cleanEmail, cleanEmail.split('@')[0]);
      localStorage.removeItem("mrben_pending_verification");
      return { success: true, email: cleanEmail };
    } catch {
      return { success: false, message: "Erreur technique lors de la vérification du code." };
    }
  },

  // Vérifier si un Gmail a déjà payé ce livre
  checkGmailAccess: (email, bookId) => {
    if (!email) return { hasAccess: false };
    const cleanEmail = email.trim().toLowerCase();
    const orders = storageService.getAllOrders();
    const match = orders.find(o => 
      o.clientEmail && 
      o.clientEmail.toLowerCase() === cleanEmail && 
      (o.itemId === bookId || o.itemId === "pack-duo-mr-ben")
    );

    if (match) {
      storageService.setLoggedInGmail(cleanEmail);
      // Débloquer également sur l'appareil local
      const unlocked = storageService.getUnlockedCodes();
      if (!unlocked.some(u => u.itemId === bookId || u.itemId === "pack-duo-mr-ben")) {
        unlocked.push({
          code: match.code,
          itemId: match.itemId,
          itemTitle: match.itemTitle,
          userEmail: cleanEmail,
          unlockedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));
      }
      return { hasAccess: true, order: match };
    }

    return { hasAccess: false };
  },

  // Récupérer le code actuel débloqué pour un livre
  getActiveCodeForBook: (bookId) => {
    const codes = storageService.getUnlockedCodes();
    const match = codes.find(c => c.itemId === bookId || c.itemId === "pack-duo-mr-ben");
    return match ? match.code : null;
  },

  // Valider et enregistrer un code d'accès sécurisé à usage unique (généré par l'admin ou issu d'une commande)
  unlockWithCode: (inputCode, currentBookId, userEmail) => {
    const cleanCode = (inputCode || '').trim().toUpperCase();
    const cleanEmail = (userEmail || storageService.getLoggedInGmail() || '').trim().toLowerCase();

    if (!cleanCode) {
      return { success: false, message: "Veuillez entrer un code d'accès." };
    }

    const normalize = (str) => (str || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const normalizedInput = normalize(cleanCode);

    // 1. Vérification dans les codes exclusifs générés par l'administrateur Mr Ben
    const adminCodes = storageService.getAdminGeneratedCodes();
    const adminMatch = adminCodes.find(c => 
      c.code.toUpperCase() === cleanCode || normalize(c.code) === normalizedInput
    );

    if (adminMatch) {
      // Sécurité : Vérifier si le code a été bloqué par l'administrateur Mr Ben
      if (adminMatch.status === "BLOQUÉ") {
        return { 
          success: false, 
          message: "Ce code d'accès a été bloqué par l'administrateur. L'accès à la formation est révoqué." 
        };
      }

      // Sécurité : Vérifier si le code a déjà été utilisé
      if (adminMatch.status === "UTILISÉ") {
        if (cleanEmail && adminMatch.usedBy && adminMatch.usedBy.toLowerCase() === cleanEmail) {
          return { 
            success: true, 
            alreadyUnlocked: true,
            order: { itemId: adminMatch.itemId, itemTitle: adminMatch.itemTitle, code: adminMatch.code } 
          };
        }
        return { 
          success: false, 
          message: "Ce code d'accès a déjà été utilisé par un autre compte et n'est plus valable." 
        };
      }

      // Sécurité : Chaque formation a son propre code spécifique !
      if (currentBookId && adminMatch.itemId !== currentBookId) {
        return { 
          success: false, 
          message: `Ce code est strictement réservé à la formation "${adminMatch.itemTitle}". Il ne peut pas débloquer ce livre.` 
        };
      }

      // Succès : marquer le code comme DÉFINITIVEMENT UTILISÉ par ce compte unique
      adminMatch.status = "UTILISÉ";
      adminMatch.usedBy = cleanEmail || "Élève autorisé";
      adminMatch.usedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(adminCodes));

      // Synchronisation cloud immédiate en arrière-plan
      apiRequest('redeem_admin_code', {
        code: adminMatch.code,
        email: cleanEmail,
        bookId: adminMatch.itemId
      }).catch(() => {});

      // Création de la commande officielle offerte / autorisée par Mr Ben
      const order = storageService.createOrder({
        clientName: cleanEmail ? cleanEmail.split('@')[0] : adminMatch.recipientName || 'Élève Privilégié',
        clientEmail: cleanEmail || 'eleve@mrben.com',
        clientPhone: '',
        itemId: adminMatch.itemId,
        itemTitle: adminMatch.itemTitle,
        amount: 0
      });
      order.code = adminMatch.code;

      // Mettre à jour le code officiel dans la liste des commandes
      const allOrders = storageService.getAllOrders();
      const matchOrder = allOrders.find(o => o.id === order.id);
      if (matchOrder) {
        matchOrder.code = adminMatch.code;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
      }

      // S'assurer que le code admin est bien enregistré dans les codes débloqués
      const unlocked = storageService.getUnlockedCodes();
      if (!unlocked.some(u => u.code === adminMatch.code)) {
        unlocked.push({
          code: adminMatch.code,
          itemId: adminMatch.itemId,
          itemTitle: adminMatch.itemTitle,
          userEmail: cleanEmail,
          unlockedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));
      }

      return { success: true, order };
    }

    // 2. Vérification dans les commandes existantes (pour réactivation d'un achat officiel)
    const orders = storageService.getAllOrders();
    const order = orders.find(o => o.code.toUpperCase() === cleanCode);

    if (order) {
      if (currentBookId && order.itemId !== currentBookId && order.itemId !== "pack-duo-mr-ben") {
        return { 
          success: false, 
          message: `Ce code correspond à la formation "${order.itemTitle}".` 
        };
      }

      const unlocked = storageService.getUnlockedCodes();
      if (!unlocked.some(u => u.code === cleanCode)) {
        unlocked.push({
          code: cleanCode,
          itemId: order.itemId,
          itemTitle: order.itemTitle,
          userEmail: cleanEmail || order.clientEmail,
          unlockedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));
      }
      return { success: true, order };
    }

    return { 
      success: false, 
      message: "Code d'accès introuvable ou invalide. Vérifiez l'orthographe du code." 
    };
  },

  // Créer une commande suite à un paiement
  createOrder: ({ clientName, clientEmail, clientPhone, itemId, itemTitle, amount, promoCode, discountAmount, paymentMethod = 'FedaPay Live', transactionId = '' }) => {
    const orders = storageService.getAllOrders();
    
    // Génération d'un code unique lisible
    const prefix = itemId === "livre-bd-storytelling" ? "MB-BD" : itemId === "livre-videos-ia" ? "MB-VID" : "MB-DUO";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `${prefix}-${randomNum}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone ? clientPhone.trim() : "",
      itemTitle,
      itemId,
      amount,
      currency: "FCFA",
      code: generatedCode,
      promoCode: promoCode ? String(promoCode).trim().toUpperCase() : null,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod: paymentMethod || "FedaPay Live",
      transactionId: transactionId || "",
      date: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      status: "Actif"
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Débloque automatiquement sur l'appareil actuel
    const unlocked = storageService.getUnlockedCodes();
    unlocked.push({
      code: generatedCode,
      itemId,
      itemTitle,
      userEmail: clientEmail.trim().toLowerCase(),
      unlockedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));

    // Synchronisation cloud en arrière-plan
    apiRequest('create_order', newOrder).catch(() => {});

    return newOrder;
  },

  // Récupérer toutes les commandes (pour l'admin)
  getAllOrders: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!saved) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
        return DEFAULT_ORDERS;
      }
      return JSON.parse(saved);
    } catch {
      return DEFAULT_ORDERS;
    }
  },

  // Calculer les statistiques du dashboard admin
  getAdminStats: () => {
    const orders = storageService.getAllOrders();
    const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.amount) || 0), 0);
    
    // Un élève correspond à un compte unique (adresse email Google distincte)
    const uniqueEmails = new Set(
      orders
        .map(o => (o.clientEmail || '').trim().toLowerCase())
        .filter(email => email.length > 0)
    );
    const totalStudents = uniqueEmails.size;
    const totalOrders = orders.length;
    
    const countBD = orders.filter(o => o.itemId === "livre-bd-storytelling").length;
    const countVideo = orders.filter(o => o.itemId === "livre-videos-ia").length;
    const countDuo = orders.filter(o => o.itemId === "pack-duo-mr-ben").length;

    return {
      totalRevenue,
      totalStudents,
      totalOrders,
      countBD,
      countVideo,
      countDuo
    };
  },

  // Récupérer la liste des codes d'accès exclusifs générés par l'admin Mr Ben
  getAdminGeneratedCodes: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CODES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  // Générer un code d'accès sécurisé à usage unique spécifique à une formation
  createAdminAccessCode: ({ itemId, recipientName }) => {
    const codes = storageService.getAdminGeneratedCodes();
    const isBD = itemId === 'livre-bd-storytelling';
    const prefix = isBD ? 'BD' : 'VID';
    
    // 8 caractères aléatoires lisibles et sécurisés
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart1 = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    const randPart2 = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    const newCode = `${prefix}-${randPart1}-${randPart2}`;

    const itemTitle = isBD ? "L'Art du Storytelling & Bandes Dessinées" : "Création de Vidéos Virales avec l'IA";

    const newCodeEntry = {
      id: `code-${Date.now()}`,
      code: newCode,
      itemId,
      itemTitle,
      recipientName: recipientName?.trim() || "Bénéficiaire Privilégié",
      createdAt: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      status: "DISPONIBLE", // "DISPONIBLE" | "UTILISÉ"
      usedBy: null,
      usedAt: null
    };

    codes.unshift(newCodeEntry);
    localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(codes));

    // Synchronisation cloud en arrière-plan
    apiRequest('create_admin_code', newCodeEntry).catch(() => {});

    return newCodeEntry;
  },

  // Bloquer un code d'accès gratuit (révoque immédiatement l'accès de l'élève)
  blockAdminCode: (codeId) => {
    try {
      const codes = storageService.getAdminGeneratedCodes();
      const codeItem = codes.find(c => c.id === codeId || c.code === codeId);
      if (!codeItem) return false;

      codeItem.status = "BLOQUÉ";
      codeItem.blockedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(codes));

      // 1. Purger ce code de la liste des codes débloqués
      const unlocked = storageService.getUnlockedCodes();
      const nextUnlocked = unlocked.filter(u => u.code !== codeItem.code);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(nextUnlocked));

      // 2. Marquer la commande correspondante comme bloquée
      const orders = storageService.getAllOrders();
      const nextOrders = orders.map(o => {
        if (o.code === codeItem.code) {
          return { ...o, status: "BLOQUÉ" };
        }
        return o;
      });
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));

      // 3. Déconnexion immédiate de l'utilisateur concerné s'il est actif sur cet appareil
      const currentEmail = storageService.getLoggedInGmail();
      if (currentEmail && codeItem.usedBy && codeItem.usedBy.toLowerCase() === currentEmail.toLowerCase()) {
        storageService.logout();
        window.dispatchEvent(new Event('mrben_auth_changed'));
      }

      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('block_admin_code', { codeId }).catch(() => {});

      return true;
    } catch {
      return false;
    }
  },

  // Débloquer / Réactiver un code d'accès gratuit
  unblockAdminCode: (codeId) => {
    try {
      const codes = storageService.getAdminGeneratedCodes();
      const codeItem = codes.find(c => c.id === codeId || c.code === codeId);
      if (!codeItem) return false;

      if (codeItem.usedBy) {
        codeItem.status = "UTILISÉ";

        // Réactiver la commande
        const orders = storageService.getAllOrders();
        const nextOrders = orders.map(o => {
          if (o.code === codeItem.code) {
            return { ...o, status: "ACTIF" };
          }
          return o;
        });
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));

        // Réactiver dans les codes débloqués
        const unlocked = storageService.getUnlockedCodes();
        if (!unlocked.some(u => u.code === codeItem.code)) {
          unlocked.push({
            code: codeItem.code,
            itemId: codeItem.itemId,
            itemTitle: codeItem.itemTitle,
            userEmail: codeItem.usedBy,
            unlockedAt: new Date().toISOString()
          });
          localStorage.setItem(STORAGE_KEYS.UNLOCKED_CODES, JSON.stringify(unlocked));
        }
      } else {
        codeItem.status = "DISPONIBLE";
      }

      delete codeItem.blockedAt;
      localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(codes));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('unblock_admin_code', { codeId }).catch(() => {});

      return true;
    } catch {
      return false;
    }
  },

  // Supprimer un code admin (directement possible s'il n'a pas encore été utilisé, ou s'il est bloqué)
  deleteAdminCode: (codeId) => {
    try {
      let codes = storageService.getAdminGeneratedCodes();
      const target = codes.find(c => c.id === codeId || c.code === codeId);
      
      // Sécurité : Si le code est actuellement UTILISÉ par un élève actif, exiger son blocage préalable
      if (target && target.status === "UTILISÉ") {
        return { 
          success: false, 
          message: "Ce code est actuellement activé par un élève. Veuillez d'abord cliquer sur « Bloquer » pour révoquer son accès avant de le supprimer." 
        };
      }

      codes = codes.filter(c => c.id !== codeId && c.code !== codeId);
      localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(codes));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('delete_admin_code', { codeId }).catch(() => {});

      return { success: true };
    } catch {
      return { success: false };
    }
  },

  // Génération manuelle d'un code par Mr Ben depuis le Dashboard Admin
  generateManualCode: ({ clientName, clientEmail, itemId, itemTitle, amount }) => {
    return storageService.createOrder({
      clientName: clientName || "Client WhatsApp",
      clientEmail: clientEmail || "client@direct.com",
      clientPhone: "",
      itemId,
      itemTitle,
      amount: amount || 0
    });
  },

  // Récupérer tous les prix configurés des formations
  getFormationPrices: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORMATION_PRICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          "livre-bd-storytelling": Number(parsed["livre-bd-storytelling"]) || DEFAULT_PRICES["livre-bd-storytelling"],
          "livre-videos-ia": Number(parsed["livre-videos-ia"]) || DEFAULT_PRICES["livre-videos-ia"]
        };
      }
      return { ...DEFAULT_PRICES };
    } catch {
      return { ...DEFAULT_PRICES };
    }
  },

  // Récupérer le prix d'une formation spécifique
  getFormationPrice: (bookId) => {
    const prices = storageService.getFormationPrices();
    return Number(prices[bookId]) || DEFAULT_PRICES[bookId] || 2500;
  },

  // Mettre à jour les prix des formations par l'administrateur Mr Ben
  setFormationPrices: (newPrices) => {
    try {
      const current = storageService.getFormationPrices();
      const updated = {
        "livre-bd-storytelling": Math.max(0, Math.round(Number(newPrices["livre-bd-storytelling"]) || current["livre-bd-storytelling"])),
        "livre-videos-ia": Math.max(0, Math.round(Number(newPrices["livre-videos-ia"]) || current["livre-videos-ia"]))
      };
      localStorage.setItem(STORAGE_KEYS.FORMATION_PRICES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mrben_price_changed', { detail: updated }));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('update_prices', { prices: updated }).catch(() => {});

      return updated;
    } catch {
      return DEFAULT_PRICES;
    }
  },

  // Rétablir les prix par défaut
  resetFormationPrices: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORMATION_PRICES, JSON.stringify(DEFAULT_PRICES));
      window.dispatchEvent(new CustomEvent('mrben_price_changed', { detail: DEFAULT_PRICES }));
      window.dispatchEvent(new Event('storage'));
      return { ...DEFAULT_PRICES };
    } catch {
      return { ...DEFAULT_PRICES };
    }
  },

  // =========================================================================
  // GESTION DES CODES PROMO & PROMOTEURS (COMMISSION & ESPACE PRIVÉ)
  // =========================================================================
  // Sauvegarder un code promo provenant du lien du promoteur (session uniquement)
  setPendingPromoCode: (code) => {
    try {
      if (!code) return;
      const clean = String(code).trim().toUpperCase();
      sessionStorage.setItem(STORAGE_KEYS.PENDING_PROMO, clean);
      localStorage.removeItem(STORAGE_KEYS.PENDING_PROMO); // Plus de localStorage permanent
      window.dispatchEvent(new CustomEvent('mrben_promo_detected', { detail: { code: clean } }));
    } catch {}
  },

  // Récupérer le code promo actuellement mémorisé (uniquement en session active)
  getPendingPromoCode: () => {
    try {
      const code = sessionStorage.getItem(STORAGE_KEYS.PENDING_PROMO);
      return code ? String(code).trim().toUpperCase() : null;
    } catch {
      return null;
    }
  },

  // Nettoyer définitivement le code promo mémorisé
  clearPendingPromoCode: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_PROMO);
      localStorage.removeItem(STORAGE_KEYS.PENDING_PROMO);
      window.dispatchEvent(new CustomEvent('mrben_promo_cleared'));
    } catch {}
  },

  // Détecter et mémoriser automatiquement un code promo depuis l'URL (search params ou hash)
  detectAndSavePromoFromUrl: () => {
    try {
      let promo = null;
      let params = null;

      // 1. Depuis window.location.search (?promo=...)
      if (typeof window !== 'undefined' && window.location.search) {
        params = new URLSearchParams(window.location.search);
        promo = params.get('promo');
      }

      // 2. Depuis window.location.hash (#formations?promo=... ou #?promo=...)
      if (!promo && typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('promo=')) {
        const queryStr = window.location.hash.includes('?') 
          ? window.location.hash.split('?')[1] 
          : window.location.hash.replace('#', '');
        params = new URLSearchParams(queryStr);
        promo = params.get('promo');
      }

      if (promo) {
        const clean = String(promo).trim().toUpperCase();
        storageService.setPendingPromoCode(clean);

        // Si ce promoteur est transmis via les paramètres du lien mais n'existe pas encore sur cet appareil, l'enregistrer automatiquement
        if (params && !storageService.getPromoterByCode(clean)) {
          const pct = Math.max(1, Math.min(90, parseInt(params.get('pct') || '20', 10) || 20));
          const name = params.get('name') || 'Partenaire';
          storageService.createPromoter({
            nom: '',
            prenom: decodeURIComponent(name),
            codePromo: clean,
            whatsapp: '',
            targetBookId: 'all',
            reductionPct: pct,
            commissionPct: 50
          });
        }

        return clean;
      }
    } catch {}
    return null;
  },

  getAllPromoters: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOTERS);
      const customList = saved ? JSON.parse(saved) : [];
      const merged = [...customList];
      DEFAULT_PROMOTERS.forEach(def => {
        if (!merged.some(p => (p.codePromo || '').trim().toUpperCase() === def.codePromo.toUpperCase())) {
          merged.push(def);
        }
      });
      return merged;
    } catch {
      return DEFAULT_PROMOTERS;
    }
  },

  getPromoterById: (id) => {
    const list = storageService.getAllPromoters();
    return list.find(p => p.id === id) || null;
  },

  getPromoterByCode: (code) => {
    if (!code) return null;
    const clean = String(code).trim().toUpperCase();
    const list = storageService.getAllPromoters();
    return list.find(p => (p.codePromo || '').trim().toUpperCase() === clean) || null;
  },

  createPromoter: ({ nom, prenom, codePromo, whatsapp, targetBookId, reductionPct, commissionPct }) => {
    try {
      const list = storageService.getAllPromoters();
      const cleanCode = (codePromo || '').trim().toUpperCase();

      if (!cleanCode) {
        return { success: false, message: "Le code promo ne peut pas être vide." };
      }

      // Vérifier si le code existe déjà
      const existing = list.find(p => (p.codePromo || '').toUpperCase() === cleanCode);
      if (existing) {
        return { success: false, message: `Le code promo "${cleanCode}" existe déjà. Veuillez en choisir un autre.` };
      }

      const newPromoter = {
        id: `prom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        nom: (nom || '').trim(),
        prenom: (prenom || '').trim(),
        codePromo: cleanCode,
        whatsapp: (whatsapp || '').trim(),
        targetBookId: targetBookId || 'all', // 'livre-bd-storytelling' | 'livre-videos-ia' | 'all'
        reductionPct: Math.max(1, Math.min(90, Math.round(Number(reductionPct) || 15))),
        commissionPct: Math.max(1, Math.min(90, Math.round(Number(commissionPct) || 20))),
        password: '', // défini par le promoteur lors de son 1er accès
        status: 'ACTIF', // 'ACTIF' | 'BLOQUÉ'
        salesCount: 0,
        totalEarned: 0,
        salesHistory: [],
        createdAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      };

      const updated = [newPromoter, ...list];
      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('create_promoter', newPromoter).catch(() => {});

      return { success: true, promoter: newPromoter };
    } catch {
      return { success: false, message: "Erreur lors de la création du promoteur." };
    }
  },

  // Définir ou mettre à jour le mot de passe du promoteur (avec synchro cloud Hostinger)
  setPromoterPassword: async (promoterId, password, email = '', payoutPhone = '') => {
    try {
      const list = storageService.getAllPromoters();
      const idx = list.findIndex(p => p.id === promoterId);
      if (idx === -1) return { success: false, message: "Promoteur introuvable." };

      const cleanPwd = String(password).trim();
      list[idx].password = cleanPwd;
      list[idx].passwordSetAt = new Date().toISOString();
      if (email) list[idx].email = String(email).trim().toLowerCase();
      if (payoutPhone) list[idx].payoutPhone = String(payoutPhone).trim();

      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud immédiate avec la base de données
      try {
        await apiRequest('set_promoter_password', {
          promoterId,
          password: cleanPwd,
          email: list[idx].email || '',
          payoutPhone: list[idx].payoutPhone || ''
        });
      } catch (err) {
        console.warn("Synchro cloud mot de passe promoteur:", err);
      }

      return { success: true, promoter: list[idx] };
    } catch {
      return { success: false, message: "Erreur lors de l'enregistrement du mot de passe." };
    }
  },

  // Mettre à jour le profil de retrait du promoteur (Gmail + Mobile Money)
  updatePromoterProfile: async (promoterId, email = '', payoutPhone = '') => {
    try {
      const list = storageService.getAllPromoters();
      const idx = list.findIndex(p => p.id === promoterId);
      if (idx === -1) return { success: false, message: "Promoteur introuvable." };

      if (email) list[idx].email = String(email).trim().toLowerCase();
      if (payoutPhone) list[idx].payoutPhone = String(payoutPhone).trim();

      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));

      try {
        await apiRequest('update_promoter_profile', {
          promoterId,
          email: list[idx].email || '',
          payoutPhone: list[idx].payoutPhone || ''
        });
      } catch (err) {
        console.warn("Synchro cloud profil promoteur:", err);
      }

      return { success: true, promoter: list[idx] };
    } catch {
      return { success: false, message: "Erreur lors de la mise à jour." };
    }
  },

  // Envoyer un code de confirmation par e-mail au Gmail du promoteur
  sendPromoterResetCode: async (promoterId, email = '', codePromo = '') => {
    try {
      const res = await apiRequest('send_promoter_reset_code', {
        promoterId,
        email,
        codePromo
      });
      return res;
    } catch (err) {
      return { 
        success: false, 
        error: err.message || "Erreur de connexion au serveur pour l'envoi du code." 
      };
    }
  },

  // Valider le code de confirmation reçu par e-mail et enregistrer le nouveau mot de passe
  verifyPromoterResetCode: async (promoterId, code, newPassword) => {
    try {
      const res = await apiRequest('verify_promoter_reset_code', {
        promoterId,
        code: String(code).trim(),
        newPassword: String(newPassword).trim()
      });

      if (res.success && res.promoter) {
        // Mettre à jour aussi le localStorage local
        const list = storageService.getAllPromoters();
        const idx = list.findIndex(p => p.id === promoterId);
        if (idx !== -1) {
          list[idx].password = String(newPassword).trim();
          list[idx].passwordSetAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        }
      }

      return res;
    } catch (err) {
      return { 
        success: false, 
        error: err.message || "Erreur lors de la validation du code." 
      };
    }
  },

  // Vérifier la connexion du promoteur
  verifyPromoterLogin: (promoterId, password) => {
    const promoter = storageService.getPromoterById(promoterId);
    if (!promoter) return { success: false, message: "Compte promoteur introuvable." };
    if (promoter.status === 'BLOQUÉ') {
      return { success: false, message: "Ce compte promoteur a été bloqué par l'administration." };
    }
    if (!promoter.password) {
      return { success: false, needsSetup: true, message: "Vous devez d'abord créer votre mot de passe." };
    }
    if (promoter.password !== String(password).trim()) {
      return { success: false, message: "Mot de passe incorrect." };
    }
    return { success: true, promoter };
  },

  // Bloquer / Débloquer un promoteur
  togglePromoterStatus: (promoterId) => {
    try {
      const list = storageService.getAllPromoters();
      const idx = list.findIndex(p => p.id === promoterId);
      if (idx === -1) return null;
      list[idx].status = list[idx].status === 'ACTIF' ? 'BLOQUÉ' : 'ACTIF';
      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('toggle_promoter_status', { promoterId }).catch(() => {});

      return list[idx];
    } catch {
      return null;
    }
  },

  // Supprimer définitivement un promoteur
  deletePromoter: (promoterId) => {
    try {
      const list = storageService.getAllPromoters();
      const filtered = list.filter(p => p.id !== promoterId);
      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));

      // Synchronisation cloud en arrière-plan
      apiRequest('delete_promoter', { promoterId }).catch(() => {});

      return true;
    } catch {
      return false;
    }
  },

  // Calculer et valider un code promo appliqué par un acheteur
  validatePromoCode: (code, bookId) => {
    if (!code) return { valid: false, message: "Veuillez saisir un code promo." };
    const promoter = storageService.getPromoterByCode(code);
    if (!promoter) {
      return { valid: false, message: "Ce code promo n'existe pas." };
    }
    if (promoter.status === 'BLOQUÉ') {
      return { valid: false, message: "Ce code promo a été désactivé." };
    }
    if (promoter.targetBookId && promoter.targetBookId !== 'all' && promoter.targetBookId !== bookId) {
      return { valid: false, message: "Ce code promo n'est pas valable pour cette formation." };
    }

    const originalPrice = storageService.getFormationPrice(bookId);
    const reductionPct = promoter.reductionPct || 0;
    const discountAmount = Math.round((originalPrice * reductionPct) / 100);
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    
    // Commission du promoteur calculée sur le montant payé par l'élève
    const commissionPct = promoter.commissionPct || 0;
    const commissionAmount = Math.round((finalPrice * commissionPct) / 100);
    const mrBenShare = Math.max(0, finalPrice - commissionAmount);

    return {
      valid: true,
      promoter,
      originalPrice,
      reductionPct,
      discountAmount,
      finalPrice,
      commissionPct,
      commissionAmount,
      mrBenShare
    };
  },

  // Enregistrer une vente réussie réalisée avec un code promo
  recordPromoSale: (promoCode, { bookId, bookTitle, buyerName, buyerEmail, orderId, paidAmount }) => {
    try {
      const list = storageService.getAllPromoters();
      const cleanCode = (promoCode || '').trim().toUpperCase();
      const idx = list.findIndex(p => (p.codePromo || '').toUpperCase() === cleanCode);
      if (idx === -1) return false;

      const promoter = list[idx];
      const commissionPct = promoter.commissionPct || 0;
      const commissionAmount = Math.round((paidAmount * commissionPct) / 100);

      const saleRecord = {
        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        orderId: orderId || '',
        bookId,
        bookTitle: bookTitle || 'Formation Mr Ben',
        buyerName: buyerName || 'Élève',
        buyerEmail: buyerEmail || '',
        paidAmount,
        commissionEarned: commissionAmount
      };

      promoter.salesCount = (promoter.salesCount || 0) + 1;
      promoter.totalEarned = (promoter.totalEarned || 0) + commissionAmount;
      promoter.salesHistory = [saleRecord, ...(promoter.salesHistory || [])];

      list[idx] = promoter;
      localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch {
      return false;
    }
  }
};

// Synchronisation automatique dès le chargement dans le navigateur
if (typeof window !== 'undefined') {
  setTimeout(() => {
    storageService.initCloudSync();
  }, 100);
}
