// Gestion des codes d'accès, commandes et statistiques locales (compatible intégration backend / Supabase)

const STORAGE_KEYS = {
  UNLOCKED_CODES: "mrben_unlocked_codes",
  ORDERS: "mrben_orders_list",
  ACTIVE_USER: "mrben_current_user",
  ADMIN_CODES: "mrben_admin_generated_codes"
};

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

export const storageService = {
  // Déconnexion complète : purge l'e-mail connecté, les codes en cache et la session
  logout: () => {
    try {
      localStorage.removeItem("mrben_logged_in_gmail");
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_CODES);
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

      // 1. Vérifier si une commande officielle (achat ou duo) est associée à ce compte Google
      const orders = storageService.getAllOrders();
      const hasOrder = orders.some(o => 
        o.clientEmail && 
        o.clientEmail.toLowerCase() === cleanEmail && 
        (o.itemId === bookId || o.itemId === "pack-duo-mr-ben")
      );
      if (hasOrder) return true;

      // 2. Vérifier si un code admin à usage unique a été activé par ce compte
      const adminCodes = storageService.getAdminGeneratedCodes();
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
        c.userEmail && c.userEmail.toLowerCase() === cleanEmail
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
  createOrder: ({ clientName, clientEmail, clientPhone, itemId, itemTitle, amount }) => {
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
    const totalStudents = orders.length;
    
    const countBD = orders.filter(o => o.itemId === "livre-bd-storytelling").length;
    const countVideo = orders.filter(o => o.itemId === "livre-videos-ia").length;
    const countDuo = orders.filter(o => o.itemId === "pack-duo-mr-ben").length;

    return {
      totalRevenue,
      totalStudents,
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
    return newCodeEntry;
  },

  // Supprimer un code admin de la liste
  deleteAdminCode: (codeId) => {
    try {
      let codes = storageService.getAdminGeneratedCodes();
      codes = codes.filter(c => c.id !== codeId && c.code !== codeId);
      localStorage.setItem(STORAGE_KEYS.ADMIN_CODES, JSON.stringify(codes));
      return codes;
    } catch {
      return [];
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
  }
};
