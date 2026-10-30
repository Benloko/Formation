<?php
// =============================================================================
// API CENTRALE SÉCURISÉE MR BEN (SYNCHRONISATION UNIVERSELLE)
// =============================================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/smtp.php';

try {
    $pdo = getDatabaseConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion à la base de données : ' . $e->getMessage()
    ]);
    exit();
}

// Récupération de l'action demandée
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$inputData = [];

$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $inputData = $decoded;
        if (empty($action) && isset($inputData['action'])) {
            $action = $inputData['action'];
        }
    }
}

if (!function_exists('getCountryNameByCode')) {
    function getCountryNameByCode($code) {
        $map = [
            'BJ' => 'Bénin',
            'CI' => "Côte d'Ivoire",
            'SN' => 'Sénégal',
            'TG' => 'Togo',
            'CM' => 'Cameroun',
            'FR' => 'France',
            'BF' => 'Burkina Faso',
            'ML' => 'Mali',
            'NE' => 'Niger',
            'GA' => 'Gabon',
            'CG' => 'Congo',
            'CD' => 'RD Congo',
            'GN' => 'Guinée',
            'TD' => 'Tchad',
            'BE' => 'Belgique',
            'CA' => 'Canada',
            'US' => 'États-Unis',
            'CH' => 'Suisse',
            'MA' => 'Maroc',
            'TN' => 'Tunisie',
            'DZ' => 'Algérie'
        ];
        return $map[strtoupper($code)] ?? $code;
    }
}

switch ($action) {
    case 'where_am_i':
        echo json_encode([
            'success' => true,
            'dir' => __DIR__,
            'doc_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
            'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? '',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit();

    // -------------------------------------------------------------------------
    // 1. Récupération globale pour synchronisation instantanée du frontend
    // -------------------------------------------------------------------------
    case 'get_all':
        $email = strtolower(trim($_GET['email'] ?? $inputData['email'] ?? ''));

        // Promoteurs
        $stmt = $pdo->query("SELECT * FROM promoters ORDER BY created_at DESC");
        $promoters = $stmt->fetchAll();
        foreach ($promoters as &$p) {
            $p['reductionPct'] = (int)($p['reduction_pct'] ?? 20);
            $p['commissionPct'] = (int)($p['commission_pct'] ?? 50);
            $p['codePromo'] = $p['code_promo'] ?? '';
            $p['targetBookId'] = $p['target_book_id'] ?? 'all';
            $p['salesCount'] = (int)($p['sales_count'] ?? 0);
            $p['totalEarned'] = (int)($p['total_earned'] ?? 0);
            $p['email'] = $p['email'] ?? '';
            $p['payoutPhone'] = $p['payout_phone'] ?? $p['whatsapp'] ?? '';
            $p['passwordSetAt'] = $p['password_set_at'] ?? '';
            $p['salesHistory'] = json_decode($p['sales_history'] ?? '[]', true) ?: [];
        }

        // Codes admin VIP
        $stmt = $pdo->query("SELECT * FROM admin_codes ORDER BY id DESC");
        $adminCodes = $stmt->fetchAll();
        foreach ($adminCodes as &$c) {
            $c['itemId'] = $c['item_id'] ?? '';
            $c['itemTitle'] = $c['item_title'] ?? '';
            $c['recipientName'] = $c['recipient_name'] ?? '';
            $c['usedBy'] = $c['used_by'] ?? null;
            $c['usedAt'] = $c['used_at'] ?? null;
            $c['blockedAt'] = $c['blocked_at'] ?? null;
            $c['createdAt'] = $c['created_at'] ?? '';
        }

        // Commandes
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll();
        foreach ($orders as &$o) {
            $o['clientName'] = $o['client_name'] ?? '';
            $o['clientEmail'] = $o['client_email'] ?? '';
            $o['clientPhone'] = $o['client_phone'] ?? '';
            $o['itemId'] = $o['item_id'] ?? '';
            $o['itemTitle'] = $o['item_title'] ?? '';
            $o['amount'] = (int)($o['amount'] ?? 0);
            $o['promoCode'] = $o['promo_code'] ?? null;
            $o['discountAmount'] = (int)($o['discount_amount'] ?? 0);
            $o['paymentMethod'] = $o['payment_method'] ?? '';
        }

        // Tarifs & Prix d'origine barrés
        $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('formation_prices', 'formation_original_prices')");
        $stmt->execute();
        $settingsRows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $prices = [
            'livre-bd-storytelling' => 2500,
            'livre-videos-ia' => 3100
        ];
        $originalPrices = [
            'livre-bd-storytelling' => 5000,
            'livre-videos-ia' => 6000
        ];

        if (!empty($settingsRows['formation_prices'])) {
            $decodedPrices = json_decode($settingsRows['formation_prices'], true);
            if (is_array($decodedPrices)) {
                $prices = array_merge($prices, $decodedPrices);
            }
        }
        if (!empty($settingsRows['formation_original_prices'])) {
            $decodedOriginalPrices = json_decode($settingsRows['formation_original_prices'], true);
            if (is_array($decodedOriginalPrices)) {
                $originalPrices = array_merge($originalPrices, $decodedOriginalPrices);
            }
        }

        // Formations débloquées pour l'email connecté
        $unlocked = [];
        if (!empty($email)) {
            $stmt = $pdo->prepare("SELECT book_id FROM unlocked_books WHERE LOWER(email) = ?");
            $stmt->execute([$email]);
            $unlocked = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        echo json_encode([
            'success' => true,
            'promoters' => $promoters,
            'adminCodes' => $adminCodes,
            'orders' => $orders,
            'prices' => $prices,
            'originalPrices' => $originalPrices,
            'unlocked' => $unlocked
        ]);
        break;

    // -------------------------------------------------------------------------
    // 2. Création d'un promoteur
    // -------------------------------------------------------------------------
    case 'create_promoter':
        $code = strtoupper(trim($inputData['codePromo'] ?? ''));
        if (empty($code)) {
            echo json_encode(['success' => false, 'message' => 'Code promo requis.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id FROM promoters WHERE UPPER(code_promo) = ?");
        $stmt->execute([$code]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => "Le code promo \"$code\" existe déjà."]);
            exit();
        }

        $id = $inputData['id'] ?? ('prom_' . time() . '_' . substr(md5(uniqid()), 0, 5));
        $nom = trim($inputData['nom'] ?? '');
        $prenom = trim($inputData['prenom'] ?? '');
        $whatsapp = trim($inputData['whatsapp'] ?? '');
        $targetBookId = $inputData['targetBookId'] ?? 'all';
        $reductionPct = max(1, min(90, (int)($inputData['reductionPct'] ?? 20)));
        $commissionPct = max(1, min(90, (int)($inputData['commissionPct'] ?? 50)));
        $createdAt = $inputData['createdAt'] ?? date('d/m/Y, H:i');

        $stmt = $pdo->prepare("INSERT INTO promoters (
            id, nom, prenom, code_promo, whatsapp, target_book_id, reduction_pct, commission_pct, status, sales_count, total_earned, sales_history, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIF', 0, 0, '[]', ?)");

        $stmt->execute([$id, $nom, $prenom, $code, $whatsapp, $targetBookId, $reductionPct, $commissionPct, $createdAt]);

        echo json_encode([
            'success' => true,
            'promoter' => [
                'id' => $id,
                'nom' => $nom,
                'prenom' => $prenom,
                'codePromo' => $code,
                'whatsapp' => $whatsapp,
                'targetBookId' => $targetBookId,
                'reductionPct' => $reductionPct,
                'commissionPct' => $commissionPct,
                'status' => 'ACTIF',
                'salesCount' => 0,
                'totalEarned' => 0,
                'salesHistory' => [],
                'createdAt' => $createdAt
            ]
        ]);
        break;

    // -------------------------------------------------------------------------
    // 2b. Mise à jour d'un promoteur (Code promo, pourcentages, infos)
    // -------------------------------------------------------------------------
    case 'update_promoter':
        $id = trim($inputData['promoterId'] ?? $inputData['id'] ?? '');
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'Identifiant du promoteur requis.']);
            exit();
        }

        $code = strtoupper(trim($inputData['codePromo'] ?? ''));
        if (empty($code)) {
            echo json_encode(['success' => false, 'message' => 'Le code promo ne peut pas être vide.']);
            exit();
        }

        // Vérifier si le code promo est déjà utilisé par un AUTRE promoteur
        $stmt = $pdo->prepare("SELECT id FROM promoters WHERE UPPER(code_promo) = ? AND id != ?");
        $stmt->execute([$code, $id]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => "Le code promo \"$code\" est déjà attribué à un autre partenaire."]);
            exit();
        }

        // Vérifier existence
        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            echo json_encode(['success' => false, 'message' => 'Promoteur introuvable.']);
            exit();
        }

        $nom = isset($inputData['nom']) ? trim($inputData['nom']) : ($existing['nom'] ?? '');
        $prenom = isset($inputData['prenom']) ? trim($inputData['prenom']) : ($existing['prenom'] ?? '');
        $whatsapp = isset($inputData['whatsapp']) ? trim($inputData['whatsapp']) : ($existing['whatsapp'] ?? '');
        $targetBookId = isset($inputData['targetBookId']) ? $inputData['targetBookId'] : ($existing['target_book_id'] ?? 'all');
        $reductionPct = max(1, min(90, (int)($inputData['reductionPct'] ?? $existing['reduction_pct'] ?? 20)));
        $commissionPct = max(1, min(90, (int)($inputData['commissionPct'] ?? $existing['commission_pct'] ?? 50)));

        $stmt = $pdo->prepare("UPDATE promoters SET 
            nom = ?, 
            prenom = ?, 
            code_promo = ?, 
            whatsapp = ?, 
            target_book_id = ?, 
            reduction_pct = ?, 
            commission_pct = ? 
            WHERE id = ?");
        $stmt->execute([$nom, $prenom, $code, $whatsapp, $targetBookId, $reductionPct, $commissionPct, $id]);

        // Retourner le promoteur mis à jour
        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
        $stmt->execute([$id]);
        $updated = $stmt->fetch();
        if ($updated) {
            $updated['reductionPct'] = (int)($updated['reduction_pct'] ?? $reductionPct);
            $updated['commissionPct'] = (int)($updated['commission_pct'] ?? $commissionPct);
            $updated['codePromo'] = $updated['code_promo'] ?? $code;
            $updated['targetBookId'] = $updated['target_book_id'] ?? $targetBookId;
            $updated['salesCount'] = (int)($updated['sales_count'] ?? 0);
            $updated['totalEarned'] = (int)($updated['total_earned'] ?? 0);
            $updated['email'] = $updated['email'] ?? '';
            $updated['payoutPhone'] = $updated['payout_phone'] ?? $updated['whatsapp'] ?? '';
            $updated['passwordSetAt'] = $updated['password_set_at'] ?? '';
            $updated['salesHistory'] = json_decode($updated['sales_history'] ?? '[]', true) ?: [];
        }

        echo json_encode([
            'success' => true,
            'message' => 'Promoteur et code promo mis à jour avec succès.',
            'promoter' => $updated
        ]);
        break;

    // -------------------------------------------------------------------------
    // 3. Suppression d'un promoteur
    // -------------------------------------------------------------------------
    case 'delete_promoter':
        $id = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM promoters WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    // -------------------------------------------------------------------------
    // 4. Activer / Bloquer un promoteur
    // -------------------------------------------------------------------------
    case 'toggle_promoter_status':
        $id = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $stmt = $pdo->prepare("SELECT status FROM promoters WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $newStatus = ($row['status'] === 'ACTIF') ? 'BLOQUÉ' : 'ACTIF';
            $stmt = $pdo->prepare("UPDATE promoters SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);
            echo json_encode(['success' => true, 'newStatus' => $newStatus]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Promoteur introuvable.']);
        }
        break;

    // -------------------------------------------------------------------------
    // 4b. Définition ou mise à jour sécurisée du mot de passe du promoteur
    // -------------------------------------------------------------------------
    case 'set_promoter_password':
        $promoterId = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $password = trim($inputData['password'] ?? '');
        $email = strtolower(trim($inputData['email'] ?? ''));
        $payoutPhone = trim($inputData['payoutPhone'] ?? $inputData['payout_phone'] ?? '');

        if (empty($promoterId) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Identifiant et mot de passe requis.']);
            exit;
        }

        $now = date('d/m/Y, H:i');
        $stmt = $pdo->prepare("UPDATE promoters SET password = ?, password_set_at = ?, email = CASE WHEN ? != '' THEN ? ELSE email END, payout_phone = CASE WHEN ? != '' THEN ? ELSE payout_phone END, whatsapp = CASE WHEN ? != '' THEN ? ELSE whatsapp END WHERE id = ?");
        $stmt->execute([$password, $now, $email, $email, $payoutPhone, $payoutPhone, $payoutPhone, $payoutPhone, $promoterId]);

        // Retourner le promoteur mis à jour
        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
        $stmt->execute([$promoterId]);
        $p = $stmt->fetch();
        if ($p) {
            $phone = !empty($p['whatsapp']) ? $p['whatsapp'] : (!empty($p['payout_phone']) ? $p['payout_phone'] : '');
            $p['reductionPct'] = (int)($p['reduction_pct'] ?? 20);
            $p['commissionPct'] = (int)($p['commission_pct'] ?? 50);
            $p['codePromo'] = $p['code_promo'] ?? '';
            $p['targetBookId'] = $p['target_book_id'] ?? 'all';
            $p['salesCount'] = (int)($p['sales_count'] ?? 0);
            $p['totalEarned'] = (int)($p['total_earned'] ?? 0);
            $p['email'] = $p['email'] ?? '';
            $p['whatsapp'] = $phone;
            $p['payoutPhone'] = $phone;
            $p['passwordSetAt'] = $p['password_set_at'] ?? '';
            $p['salesHistory'] = json_decode($p['sales_history'] ?? '[]', true) ?: [];
        }

        echo json_encode(['success' => true, 'promoter' => $p]);
        exit;

    // Réinitialisation ou modification du mot de passe par l'administrateur
    case 'admin_reset_promoter_password':
        $promoterId = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $newPassword = trim($inputData['password'] ?? '');
        if (empty($promoterId)) {
            echo json_encode(['success' => false, 'error' => 'Identifiant promoteur requis.']);
            exit;
        }
        if (empty($newPassword)) {
            // Remise à zéro : le compte redevient "En attente" et le promoteur configurera son mot de passe à sa prochaine visite
            $stmt = $pdo->prepare("UPDATE promoters SET password = NULL, password_set_at = NULL, reset_code = NULL, reset_code_expires_at = NULL WHERE id = ?");
            $stmt->execute([$promoterId]);
        } else {
            $now = date('d/m/Y, H:i');
            $stmt = $pdo->prepare("UPDATE promoters SET password = ?, password_set_at = ?, reset_code = NULL, reset_code_expires_at = NULL WHERE id = ?");
            $stmt->execute([$newPassword, $now, $promoterId]);
        }
        echo json_encode(['success' => true]);
        exit;

    // -------------------------------------------------------------------------
    // 4c. Mise à jour profil de retrait (Gmail de récupération + Numéro Mobile Money)
    // -------------------------------------------------------------------------
    case 'update_promoter_profile':
        $promoterId = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $email = strtolower(trim($inputData['email'] ?? ''));
        $payoutPhone = trim($inputData['payoutPhone'] ?? $inputData['payout_phone'] ?? '');

        if (empty($promoterId)) {
            echo json_encode(['success' => false, 'error' => 'Identifiant requis.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE promoters SET email = CASE WHEN ? != '' THEN ? ELSE email END, payout_phone = CASE WHEN ? != '' THEN ? ELSE payout_phone END, whatsapp = CASE WHEN ? != '' THEN ? ELSE whatsapp END WHERE id = ?");
        $stmt->execute([$email, $email, $payoutPhone, $payoutPhone, $payoutPhone, $payoutPhone, $promoterId]);

        echo json_encode(['success' => true]);
        exit;

    // -------------------------------------------------------------------------
    // 4d. Identification et validation directe d'un promoteur par son compte Google
    // -------------------------------------------------------------------------
    case 'find_promoter_by_google':
        $email = strtolower(trim($inputData['email'] ?? ''));
        $codePromo = strtoupper(trim($inputData['codePromo'] ?? $inputData['promo'] ?? ''));
        if (empty($email)) {
            echo json_encode(['success' => false, 'error' => "Adresse Gmail requise."]);
            exit;
        }

        // 1. Chercher si un promoteur possède déjà cette adresse Gmail
        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE LOWER(email) = ?");
        $stmt->execute([$email]);
        $p = $stmt->fetch();

        // 2. Si non trouvé par email, mais un code promo spécifique est fourni
        if (!$p && !empty($codePromo)) {
            $stmt = $pdo->prepare("SELECT * FROM promoters WHERE UPPER(code_promo) = ?");
            $stmt->execute([$codePromo]);
            $candidate = $stmt->fetch();
            if ($candidate && (empty($candidate['email']) || strtolower(trim($candidate['email'])) === $email)) {
                $stmt = $pdo->prepare("UPDATE promoters SET email = ? WHERE id = ?");
                $stmt->execute([$email, $candidate['id']]);
                $candidate['email'] = $email;
                $p = $candidate;
            }
        }

        if (!$p) {
            echo json_encode([
                'success' => false, 
                'error' => "Ce compte Google ({$email}) n'est associé à aucun compte promoteur officiel."
            ]);
            exit;
        }

        if ($p['status'] === 'BLOQUÉ') {
            echo json_encode([
                'success' => false, 
                'error' => "Ce compte promoteur est actuellement bloqué par l'administration."
            ]);
            exit;
        }

        $phone = !empty($p['whatsapp']) ? $p['whatsapp'] : (!empty($p['payout_phone']) ? $p['payout_phone'] : '');
        $promoterData = [
            'id' => $p['id'],
            'prenom' => $p['prenom'],
            'nom' => $p['nom'],
            'codePromo' => $p['code_promo'],
            'reductionPct' => (int)($p['reduction_pct'] ?? 20),
            'commissionPct' => (int)($p['commission_pct'] ?? 50),
            'targetBookId' => $p['target_book_id'] ?? 'all',
            'salesCount' => (int)($p['sales_count'] ?? 0),
            'totalEarned' => (int)($p['total_earned'] ?? 0),
            'email' => $p['email'],
            'whatsapp' => $phone,
            'payoutPhone' => $phone,
            'password' => $p['password'],
            'status' => $p['status'] ?? 'ACTIF',
            'salesHistory' => json_decode($p['sales_history'] ?? '[]', true) ?: []
        ];

        echo json_encode([
            'success' => true,
            'promoter' => $promoterData
        ]);
        exit;

    // -------------------------------------------------------------------------
    // 4d. Envoi d'un code de confirmation par e-mail à l'adresse Gmail du promoteur
    // -------------------------------------------------------------------------
    case 'send_promoter_reset_code':
        $promoterId = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $promoCode = strtoupper(trim($inputData['codePromo'] ?? $inputData['promo'] ?? ''));
        $email = strtolower(trim($inputData['email'] ?? ''));

        // Trouver le promoteur
        $promoter = null;
        if (!empty($promoterId)) {
            $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
            $stmt->execute([$promoterId]);
            $promoter = $stmt->fetch();
        }
        if (!$promoter && !empty($promoCode)) {
            $stmt = $pdo->prepare("SELECT * FROM promoters WHERE UPPER(code_promo) = ?");
            $stmt->execute([$promoCode]);
            $promoter = $stmt->fetch();
        }
        if (!$promoter && !empty($email)) {
            $stmt = $pdo->prepare("SELECT * FROM promoters WHERE LOWER(email) = ?");
            $stmt->execute([$email]);
            $promoter = $stmt->fetch();
        }

        if (!$promoter) {
            echo json_encode(['success' => false, 'error' => 'Compte promoteur introuvable.']);
            exit;
        }

        $targetEmail = strtolower(trim($promoter['email'] ?? ''));
        if (empty($targetEmail) || !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false, 
                'error' => "Aucune adresse Gmail n'est enregistrée pour ce promoteur. Veuillez contacter Mr Ben."
            ]);
            exit;
        }

        // Code à 6 chiffres sécurisé
        $code = strval(random_int(100000, 999999));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Sauvegarde immédiate dans la base de données
        $stmt = $pdo->prepare("UPDATE promoters SET reset_code = ?, reset_code_expires_at = ? WHERE id = ?");
        $stmt->execute([$code, $expiresAt, $promoter['id']]);

        // Préparation du courriel professionnel
        $prenom = htmlspecialchars($promoter['prenom'] ?: 'Partenaire');
        $subject = "Mr Ben — Code de confirmation : {$code}";

        $htmlMessage = '
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de confirmation</title>
        </head>
        <body style="margin:0;padding:24px;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#131c31;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 20px;text-align:center;background:linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%);">
                <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-weight:bold;font-size:18px;margin-bottom:12px;">MB</div>
                <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700;">Code de Récupération</h1>
                <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Espace Partenaire Promoteur Mr Ben</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 24px;">
                <p style="font-size:14px;color:#cbd5e1;line-height:1.5;margin:0 0 16px;">
                  Bonjour <strong>' . $prenom . '</strong>,
                </p>
                <p style="font-size:14px;color:#cbd5e1;line-height:1.5;margin:0 0 20px;">
                  Vous avez demandé la réinitialisation de votre mot de passe secret. Voici votre code de confirmation personnel :
                </p>
                <div style="background:#0a0f1d;border:2px dashed #6366f1;border-radius:10px;padding:18px;text-align:center;margin:20px 0;">
                  <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:#ffffff;font-family:monospace;">' . $code . '</span>
                  <div style="font-size:12px;color:#818cf8;margin-top:6px;font-weight:500;">Valable 15 minutes</div>
                </div>
                <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:20px 0 0;">
                  Copiez ou saisissez ce code directement sur l\'application pour définir votre nouveau mot de passe.
                </p>
                <p style="font-size:12px;color:#64748b;line-height:1.4;margin:16px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
                  Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet e-mail. Votre compte reste parfaitement protégé.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#0d1424;text-align:center;font-size:11px;color:#64748b;">
                © ' . date('Y') . ' Formations Mr Ben • Tous droits réservés
              </td>
            </tr>
          </table>
        </body>
        </html>';

        // Envoi réel via SMTP sécurisé (Hostinger / Gmail)
        $mailRes = sendSmtpMail($targetEmail, $subject, $htmlMessage);
        $mailSuccess = !empty($mailRes['success']);

        if (!$mailSuccess) {
            $errDetail = $mailRes['error'] ?? "Impossible d'acheminer le courriel.";
            echo json_encode([
                'success' => false,
                'error' => "Échec de l'envoi du code par e-mail : {$errDetail}"
            ]);
            exit;
        }

        // Masquer l'adresse pour l'affichage (ex: be***@gmail.com)
        $emailParts = explode('@', $targetEmail);
        $userPart = $emailParts[0];
        $maskedUser = strlen($userPart) <= 2 ? $userPart : substr($userPart, 0, 2) . str_repeat('*', max(2, strlen($userPart) - 2));
        $maskedEmail = $maskedUser . '@' . ($emailParts[1] ?? 'gmail.com');

        echo json_encode([
            'success' => true,
            'message' => "Un code de confirmation a été envoyé sur votre adresse Gmail.",
            'maskedEmail' => $maskedEmail,
            'mailSent' => true
        ]);
        exit;

    // Action de test de la configuration SMTP
    case 'test_smtp':
        $to = $inputData['to'] ?? $_GET['to'] ?? '';
        if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => "Veuillez fournir une adresse email valide dans 'to'."]);
            exit;
        }
        $testSubject = "Mr Ben — Test de configuration SMTP";
        $testMsg = "<h1>Test SMTP Réussi !</h1><p>Votre serveur SMTP Mr Ben fonctionne parfaitement.</p>";
        $res = sendSmtpMail($to, $testSubject, $testMsg);
        echo json_encode($res);
        exit;

    // -------------------------------------------------------------------------
    // 4e. Vérification du code reçu et enregistrement du nouveau mot de passe
    // -------------------------------------------------------------------------
    case 'verify_promoter_reset_code':
        $promoterId = $inputData['promoterId'] ?? $inputData['id'] ?? '';
        $code = trim($inputData['code'] ?? '');
        $newPassword = trim($inputData['newPassword'] ?? $inputData['password'] ?? '');

        if (empty($promoterId) || empty($code) || empty($newPassword)) {
            echo json_encode(['success' => false, 'error' => 'Veuillez saisir le code et votre nouveau mot de passe.']);
            exit;
        }

        if (strlen($newPassword) < 4) {
            echo json_encode(['success' => false, 'error' => 'Le mot de passe doit comporter au moins 4 caractères.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
        $stmt->execute([$promoterId]);
        $promoter = $stmt->fetch();

        if (!$promoter) {
            echo json_encode(['success' => false, 'error' => 'Compte promoteur introuvable.']);
            exit;
        }

        $savedCode = trim($promoter['reset_code'] ?? '');
        $expiresAt = $promoter['reset_code_expires_at'] ?? '';

        if (empty($savedCode) || $savedCode !== $code) {
            echo json_encode(['success' => false, 'error' => 'Code de confirmation incorrect. Vérifiez vos e-mails.']);
            exit;
        }

        if (!empty($expiresAt) && strtotime($expiresAt) < time()) {
            echo json_encode(['success' => false, 'error' => 'Ce code a expiré (plus de 15 min). Veuillez en demander un nouveau.']);
            exit;
        }

        // Succès : mise à jour du mot de passe dans la DB et effacement du code
        $now = date('d/m/Y, H:i');
        $stmt = $pdo->prepare("UPDATE promoters SET password = ?, password_set_at = ?, reset_code = NULL, reset_code_expires_at = NULL WHERE id = ?");
        $stmt->execute([$newPassword, $now, $promoterId]);

        // Recharger le profil complet
        $stmt = $pdo->prepare("SELECT * FROM promoters WHERE id = ?");
        $stmt->execute([$promoterId]);
        $p = $stmt->fetch();
        if ($p) {
            $p['reductionPct'] = (int)($p['reduction_pct'] ?? 20);
            $p['commissionPct'] = (int)($p['commission_pct'] ?? 50);
            $p['codePromo'] = $p['code_promo'] ?? '';
            $p['targetBookId'] = $p['target_book_id'] ?? 'all';
            $p['salesCount'] = (int)($p['sales_count'] ?? 0);
            $p['totalEarned'] = (int)($p['total_earned'] ?? 0);
            $p['email'] = $p['email'] ?? '';
            $p['payoutPhone'] = $p['payout_phone'] ?? $p['whatsapp'] ?? '';
            $p['passwordSetAt'] = $p['password_set_at'] ?? '';
            $p['salesHistory'] = json_decode($p['sales_history'] ?? '[]', true) ?: [];
        }

        echo json_encode([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès !',
            'promoter' => $p
        ]);
        exit;

    // -------------------------------------------------------------------------
    // 5. Création d'un code d'accès gratuit VIP par Mr Ben
    // -------------------------------------------------------------------------
    case 'create_admin_code':
        $code = strtoupper(trim($inputData['code'] ?? ''));
        $itemId = $inputData['itemId'] ?? 'livre-bd-storytelling';
        $itemTitle = $inputData['itemTitle'] ?? '';
        $recipientName = trim($inputData['recipientName'] ?? 'Bénéficiaire Privilégié');
        $id = $inputData['id'] ?? ('code-' . time());
        $createdAt = $inputData['createdAt'] ?? date('d/m/Y, H:i');

        $stmt = $pdo->prepare("INSERT INTO admin_codes (
            id, code, item_id, item_title, recipient_name, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'DISPONIBLE', ?)");

        $stmt->execute([$id, $code, $itemId, $itemTitle, $recipientName, $createdAt]);

        echo json_encode([
            'success' => true,
            'code' => [
                'id' => $id,
                'code' => $code,
                'itemId' => $itemId,
                'itemTitle' => $itemTitle,
                'recipientName' => $recipientName,
                'status' => 'DISPONIBLE',
                'createdAt' => $createdAt
            ]
        ]);
        break;

    // -------------------------------------------------------------------------
    // 6. Bloquer / Débloquer un code d'accès
    // -------------------------------------------------------------------------
    case 'block_admin_code':
        $codeId = $inputData['codeId'] ?? $inputData['id'] ?? '';
        $blockedAt = date('d/m/Y, H:i');
        $stmt = $pdo->prepare("UPDATE admin_codes SET status = 'BLOQUÉ', blocked_at = ? WHERE id = ? OR code = ?");
        $stmt->execute([$blockedAt, $codeId, $codeId]);
        echo json_encode(['success' => true]);
        break;

    case 'unblock_admin_code':
        $codeId = $inputData['codeId'] ?? $inputData['id'] ?? '';
        $stmt = $pdo->prepare("UPDATE admin_codes SET status = CASE WHEN used_by IS NOT NULL THEN 'UTILISÉ' ELSE 'DISPONIBLE' END, blocked_at = NULL WHERE id = ? OR code = ?");
        $stmt->execute([$codeId, $codeId]);
        echo json_encode(['success' => true]);
        break;

    case 'delete_admin_code':
        $codeId = $inputData['codeId'] ?? $inputData['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM admin_codes WHERE id = ? OR code = ?");
        $stmt->execute([$codeId, $codeId]);
        echo json_encode(['success' => true]);
        break;

    // -------------------------------------------------------------------------
    // 7. Utilisation / Validation d'un code d'accès par un élève
    // -------------------------------------------------------------------------
    case 'redeem_admin_code':
        $code = strtoupper(trim($inputData['code'] ?? ''));
        $email = strtolower(trim($inputData['email'] ?? ''));
        $bookId = $inputData['bookId'] ?? '';

        if (empty($code) || empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Code et adresse e-mail requis.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_codes WHERE UPPER(code) = ?");
        $stmt->execute([$code]);
        $codeRow = $stmt->fetch();

        if (!$codeRow) {
            echo json_encode(['success' => false, 'message' => "Code d'accès introuvable ou incorrect."]);
            exit();
        }

        if ($codeRow['status'] === 'BLOQUÉ') {
            echo json_encode(['success' => false, 'message' => "Ce code d'accès a été révoqué par l'administration."]);
            exit();
        }

        if ($codeRow['status'] === 'UTILISÉ') {
            if (strtolower($codeRow['used_by']) !== $email) {
                echo json_encode(['success' => false, 'message' => "Ce code a déjà été utilisé par un autre compte."]);
                exit();
            }
        }

        $usedAt = date('d/m/Y, H:i');
        // Marquer comme utilisé
        $stmt = $pdo->prepare("UPDATE admin_codes SET status = 'UTILISÉ', used_by = ?, used_at = ? WHERE id = ?");
        $stmt->execute([$email, $usedAt, $codeRow['id']]);

        // Débloquer le livre pour l'élève
        $targetId = $codeRow['item_id'] ?: $bookId;
        $targetTitle = $codeRow['item_title'] ?: ($targetId === 'livre-bd-storytelling' ? "L'Art du Storytelling & BD" : "Création de Vidéos Virales avec l'IA");

        // Vérifier/insérer utilisateur
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, email, name) VALUES (?, ?, ?)");
        $stmt->execute(['usr_' . time(), $email, explode('@', $email)[0]]);

        // Débloquer dans unlocked_books
        $stmt = $pdo->prepare("INSERT IGNORE INTO unlocked_books (email, book_id, book_title, code) VALUES (?, ?, ?, ?)");
        $stmt->execute([$email, $targetId, $targetTitle, $code]);

        // Enregistrer la commande
        $orderId = 'ord_' . time() . '_' . substr(md5(uniqid()), 0, 4);
        $stmt = $pdo->prepare("INSERT INTO orders (
            id, client_name, client_email, item_id, item_title, amount, code, payment_method, status, date
        ) VALUES (?, ?, ?, ?, ?, 0, ?, 'Code VIP Offert', 'Actif', ?)");
        $stmt->execute([$orderId, explode('@', $email)[0], $email, $targetId, $targetTitle, $code, $usedAt]);

        echo json_encode([
            'success' => true,
            'bookId' => $targetId,
            'bookTitle' => $targetTitle,
            'order' => [
                'id' => $orderId,
                'clientEmail' => $email,
                'itemId' => $targetId,
                'itemTitle' => $targetTitle,
                'amount' => 0,
                'code' => $code,
                'status' => 'Actif',
                'date' => $usedAt
            ]
        ]);
        break;

    // -------------------------------------------------------------------------
    // 8. Enregistrement d'une commande réussie (Mobile Money direct ou FedaPay)
    // -------------------------------------------------------------------------
    case 'create_order':
        $id = $inputData['id'] ?? ('ord_' . time());
        $clientName = trim($inputData['clientName'] ?? 'Client');
        $clientEmail = strtolower(trim($inputData['clientEmail'] ?? ''));
        $clientPhone = trim($inputData['clientPhone'] ?? '');
        $itemId = $inputData['itemId'] ?? '';
        $itemTitle = $inputData['itemTitle'] ?? '';
        $amount = (int)($inputData['amount'] ?? 0);
        $code = $inputData['code'] ?? ('MB-' . strtoupper(substr(md5(uniqid()), 0, 8)));
        $promoCode = $inputData['promoCode'] ?? null;
        $discountAmount = (int)($inputData['discountAmount'] ?? 0);
        $paymentMethod = $inputData['paymentMethod'] ?? 'Paiement Direct';
        $date = $inputData['date'] ?? date('d/m/Y, H:i');

        if (!empty($clientEmail) && !empty($itemId)) {
            // Insérer commande
            $stmt = $pdo->prepare("INSERT INTO orders (
                id, client_name, client_email, client_phone, item_id, item_title, amount, code, promo_code, discount_amount, payment_method, status, date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Actif', ?)");
            $stmt->execute([$id, $clientName, $clientEmail, $clientPhone, $itemId, $itemTitle, $amount, $code, $promoCode, $discountAmount, $paymentMethod, $date]);

            // Débloquer la formation
            $stmt = $pdo->prepare("INSERT IGNORE INTO unlocked_books (email, book_id, book_title, code) VALUES (?, ?, ?, ?)");
            $stmt->execute([$clientEmail, $itemId, $itemTitle, $code]);

            // Si code promo utilisé, enregistrer la vente pour le promoteur
            if (!empty($promoCode)) {
                $stmt = $pdo->prepare("SELECT * FROM promoters WHERE UPPER(code_promo) = ?");
                $stmt->execute([strtoupper($promoCode)]);
                $promoter = $stmt->fetch();
                if ($promoter) {
                    $commPct = (int)($promoter['commission_pct'] ?? 50);
                    $commAmount = (int)round(($amount * $commPct) / 100);
                    $salesHistory = json_decode($promoter['sales_history'] ?? '[]', true) ?: [];
                    $salesHistory[] = [
                        'id' => 'sale_' . time(),
                        'date' => $date,
                        'orderId' => $id,
                        'bookId' => $itemId,
                        'bookTitle' => $itemTitle,
                        'buyerEmail' => $clientEmail,
                        'paidAmount' => $amount,
                        'commissionEarned' => $commAmount
                    ];
                    $newSalesCount = (int)($promoter['sales_count'] ?? 0) + 1;
                    $newTotalEarned = (int)($promoter['total_earned'] ?? 0) + $commAmount;

                    $stmt = $pdo->prepare("UPDATE promoters SET sales_count = ?, total_earned = ?, sales_history = ? WHERE id = ?");
                    $stmt->execute([$newSalesCount, $newTotalEarned, json_encode($salesHistory), $promoter['id']]);
                }
            }
        }

        echo json_encode(['success' => true, 'orderId' => $id, 'code' => $code]);
        break;

    // -------------------------------------------------------------------------
    // 9. Mise à jour des tarifs des formations
    // -------------------------------------------------------------------------
    case 'update_prices':
        $prices = $inputData['prices'] ?? [];
        $originalPrices = $inputData['originalPrices'] ?? [];

        if (!empty($prices) || !empty($originalPrices)) {
            if (!empty($prices)) {
                $json = json_encode($prices);
                $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('formation_prices', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
                try {
                    $stmt->execute([$json, $json]);
                } catch (Exception $e) {
                    $stmt = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES ('formation_prices', ?)");
                    $stmt->execute([$json]);
                }
            }

            if (!empty($originalPrices)) {
                $jsonOrig = json_encode($originalPrices);
                $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('formation_original_prices', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
                try {
                    $stmt->execute([$jsonOrig, $jsonOrig]);
                } catch (Exception $e) {
                    $stmt = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES ('formation_original_prices', ?)");
                    $stmt->execute([$jsonOrig]);
                }
            }

            echo json_encode([
                'success' => true, 
                'prices' => $prices, 
                'originalPrices' => $originalPrices
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Données de prix manquantes.']);
        }
        break;

    // -------------------------------------------------------------------------
    // 9.1. Vérification du mot de passe administrateur
    // -------------------------------------------------------------------------
    case 'verify_admin_password':
        $password = trim($inputData['password'] ?? '');
        if ($password === '') {
            echo json_encode(['success' => false, 'message' => 'Veuillez saisir votre mot de passe.']);
            break;
        }

        $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
        $stmt->execute();
        $storedRow = $stmt->fetch();
        $storedHash = $storedRow ? trim($storedRow['setting_value'] ?? '') : '';

        $isValid = false;
        if (empty($storedHash)) {
            // Mot de passe par défaut
            $isValid = ($password === 'ben2026');
        } else {
            if (password_verify($password, $storedHash) || $password === $storedHash) {
                $isValid = true;
            }
        }

        if ($isValid) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Mot de passe administrateur incorrect.']);
        }
        break;

    // -------------------------------------------------------------------------
    // 9.2. Mise à jour du mot de passe administrateur
    // -------------------------------------------------------------------------
    case 'update_admin_password':
        $currentPassword = trim($inputData['currentPassword'] ?? '');
        $newPassword = trim($inputData['newPassword'] ?? '');

        if ($newPassword === '') {
            echo json_encode(['success' => false, 'message' => 'Le nouveau mot de passe ne peut pas être vide.']);
            break;
        }
        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit comporter au moins 6 caractères.']);
            break;
        }

        $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
        $stmt->execute();
        $storedRow = $stmt->fetch();
        $storedHash = $storedRow ? trim($storedRow['setting_value'] ?? '') : '';

        $isCurrentValid = false;
        if (empty($storedHash)) {
            $isCurrentValid = ($currentPassword === 'ben2026');
        } else {
            if (password_verify($currentPassword, $storedHash) || $currentPassword === $storedHash) {
                $isCurrentValid = true;
            }
        }

        if (!$isCurrentValid) {
            echo json_encode(['success' => false, 'message' => 'Le mot de passe actuel est incorrect.']);
            break;
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_password', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        try {
            $stmt->execute([$newHash, $newHash]);
        } catch (Exception $e) {
            $stmt = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES ('admin_password', ?)");
            $stmt->execute([$newHash]);
        }

        echo json_encode(['success' => true, 'message' => 'Mot de passe administrateur mis à jour avec succès.']);
        break;
    // -------------------------------------------------------------------------
    // 10. Enregistrement d'une visite ou interaction en direct
    // -------------------------------------------------------------------------
    case 'record_visit':
        $visitorId = trim($inputData['visitorId'] ?? '');
        $sessionId = trim($inputData['sessionId'] ?? '');
        $page = substr(trim($inputData['page'] ?? '/'), 0, 128);
        $eventType = substr(trim($inputData['eventType'] ?? 'page_view'), 0, 64);
        $formationViewed = substr(trim($inputData['formationViewed'] ?? ''), 0, 64);
        $promoCode = substr(strtoupper(trim($inputData['promoCode'] ?? '')), 0, 64);
        $clientCountry = trim($inputData['country'] ?? '');
        $clientCountryCode = strtoupper(trim($inputData['countryCode'] ?? ''));
        $deviceType = trim($inputData['deviceType'] ?? 'Mobile');
        $os = trim($inputData['os'] ?? 'Android');
        $browser = trim($inputData['browser'] ?? 'Chrome');

        if (empty($visitorId)) {
            $visitorId = 'anon_' . substr(md5($_SERVER['REMOTE_ADDR'] ?? microtime()), 0, 16);
        }

        // Détection automatique du pays par IP si non fourni ou inconnu
        if (empty($clientCountryCode) || $clientCountryCode === 'XX') {
            $cfCountry = $_SERVER['HTTP_CF_IPCOUNTRY'] ?? '';
            if (!empty($cfCountry) && strlen($cfCountry) === 2 && $cfCountry !== 'XX') {
                $clientCountryCode = strtoupper($cfCountry);
                $clientCountry = getCountryNameByCode($clientCountryCode);
            }
        }
        if (empty($clientCountry)) {
            $clientCountry = !empty($clientCountryCode) ? getCountryNameByCode($clientCountryCode) : 'Bénin';
            if (empty($clientCountryCode)) $clientCountryCode = 'BJ';
        }

        $dateDay = date('Y-m-d');
        $ipHash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'mrben_salt'), 0, 24);

        // Déduplication anti-spam (5 secondes)
        try {
            $fiveSecAgo = date('Y-m-d H:i:s', time() - 5);
            $stmt = $pdo->prepare("SELECT id FROM site_visits WHERE visitor_id = ? AND event_type = ? AND formation_viewed = ? AND visited_at >= ? LIMIT 1");
            $stmt->execute([$visitorId, $eventType, $formationViewed, $fiveSecAgo]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => true, 'dedup' => true]);
                exit;
            }
        } catch (Exception $e) {}

        $stmt = $pdo->prepare("INSERT INTO site_visits (
            visitor_id, session_id, country, country_code, device_type, os, browser, page, formation_viewed, event_type, promo_code, ip_hash, date_day
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $visitorId, $sessionId, $clientCountry, $clientCountryCode, $deviceType, $os, $browser, $page, $formationViewed, $eventType, $promoCode, $ipHash, $dateDay
        ]);

        echo json_encode(['success' => true]);
        break;

    // -------------------------------------------------------------------------
    // 11. Récupération des statistiques & graphes pour l'espace Admin
    // -------------------------------------------------------------------------
    case 'get_analytics':
        $period = $inputData['period'] ?? $_GET['period'] ?? '7d';

        $whereClause = "1=1";
        $daysCount = 7;
        if ($period === 'today') {
            $whereClause = "date_day = '" . date('Y-m-d') . "'";
            $daysCount = 1;
        } else if ($period === '7d') {
            $whereClause = "date_day >= '" . date('Y-m-d', strtotime('-6 days')) . "'";
            $daysCount = 7;
        } else if ($period === '30d') {
            $whereClause = "date_day >= '" . date('Y-m-d', strtotime('-29 days')) . "'";
            $daysCount = 30;
        }

        // 1. KPI globaux
        $stmt = $pdo->query("SELECT 
            COUNT(*) as total_views,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(CASE WHEN event_type != 'page_view' THEN 1 END) as total_interactions,
            COUNT(CASE WHEN event_type LIKE '%unlock%' THEN 1 END) as unlock_clicks,
            COUNT(CASE WHEN event_type LIKE '%whatsapp%' THEN 1 END) as whatsapp_clicks,
            COUNT(CASE WHEN event_type LIKE '%demo%' THEN 1 END) as demo_reads
        FROM site_visits WHERE $whereClause");
        $kpis = $stmt->fetch() ?: [
            'total_views' => 0, 'unique_visitors' => 0, 'total_interactions' => 0,
            'unlock_clicks' => 0, 'whatsapp_clicks' => 0, 'demo_reads' => 0
        ];

        // 2. Évolution pour les graphes
        $dailyData = [];

        if ($period === 'today') {
            // Découpage horaire (créneaux de 3h) pour aujourd'hui
            $slots = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'];
            foreach ($slots as $slot) {
                $dailyData[$slot] = [
                    'date' => $slot,
                    'label' => $slot,
                    'views' => 0,
                    'visitors' => 0,
                    'clicks' => 0
                ];
            }

            $stmt = $pdo->query("SELECT 
                visited_at,
                visitor_id,
                event_type
            FROM site_visits WHERE date_day = '" . date('Y-m-d') . "'");
            
            $visBySlot = [];
            while ($row = $stmt->fetch()) {
                $hour = (int)date('H', strtotime($row['visited_at'] ?? 'now'));
                $slotIndex = min(7, (int)floor($hour / 3));
                $slotKey = $slots[$slotIndex];

                $dailyData[$slotKey]['views']++;
                if ($row['event_type'] !== 'page_view') {
                    $dailyData[$slotKey]['clicks']++;
                }
                $visBySlot[$slotKey][$row['visitor_id']] = true;
            }

            foreach ($slots as $slot) {
                $dailyData[$slot]['visitors'] = isset($visBySlot[$slot]) ? count($visBySlot[$slot]) : 0;
            }
        } else {
            for ($i = $daysCount - 1; $i >= 0; $i--) {
                $d = date('Y-m-d', strtotime("-$i days"));
                $dailyData[$d] = [
                    'date' => $d,
                    'label' => date('d/m', strtotime($d)),
                    'views' => 0,
                    'visitors' => 0,
                    'clicks' => 0
                ];
            }

            $stmt = $pdo->query("SELECT 
                date_day,
                COUNT(*) as views,
                COUNT(DISTINCT visitor_id) as visitors,
                COUNT(CASE WHEN event_type != 'page_view' THEN 1 END) as clicks
            FROM site_visits WHERE $whereClause GROUP BY date_day ORDER BY date_day ASC");
            while ($row = $stmt->fetch()) {
                $d = $row['date_day'];
                if (isset($dailyData[$d])) {
                    $dailyData[$d]['views'] = (int)$row['views'];
                    $dailyData[$d]['visitors'] = (int)$row['visitors'];
                    $dailyData[$d]['clicks'] = (int)$row['clicks'];
                } else if ($period === 'all') {
                    $dailyData[$d] = [
                        'date' => $d,
                        'label' => date('d/m', strtotime($d)),
                        'views' => (int)$row['views'],
                        'visitors' => (int)$row['visitors'],
                        'clicks' => (int)$row['clicks']
                    ];
                }
            }

            ksort($dailyData);
        }

        // 3. Top Pays avec pourcentages
        $topCountries = [];
        $stmt = $pdo->query("SELECT country, country_code, COUNT(*) as count FROM site_visits WHERE $whereClause GROUP BY country, country_code ORDER BY count DESC LIMIT 8");
        $totV = max(1, (int)$kpis['total_views']);
        while ($row = $stmt->fetch()) {
            $topCountries[] = [
                'country' => $row['country'] ?: 'Bénin',
                'code' => strtoupper($row['country_code'] ?: 'BJ'),
                'count' => (int)$row['count'],
                'pct' => round(((int)$row['count'] / $totV) * 100, 1)
            ];
        }

        // 4. Répartition des appareils & OS
        $devices = [];
        $stmt = $pdo->query("SELECT os, device_type, COUNT(*) as count FROM site_visits WHERE $whereClause GROUP BY os, device_type ORDER BY count DESC LIMIT 6");
        while ($row = $stmt->fetch()) {
            $devices[] = [
                'os' => $row['os'] ?: 'Android',
                'type' => $row['device_type'] ?: 'Mobile',
                'count' => (int)$row['count'],
                'pct' => round(((int)$row['count'] / $totV) * 100, 1)
            ];
        }

        // 5. Détail précis de CHAQUE PAGE VUE
        $pagesBreakdown = [];
        $stmt = $pdo->query("SELECT 
            page, 
            COUNT(*) as views, 
            COUNT(DISTINCT visitor_id) as visitors 
        FROM site_visits 
        WHERE $whereClause AND event_type = 'page_view'
        GROUP BY page 
        ORDER BY views DESC");

        while ($row = $stmt->fetch()) {
            $rawPage = trim($row['page'] ?: '/');
            $cleanKey = '/';
            $pageTitle = "Page d'Accueil (Mr Ben)";

            if (strpos($rawPage, '#formations') !== false || strpos($rawPage, 'formation') !== false) {
                $cleanKey = '#formations';
                $pageTitle = "Catalogue des Formations";
            } else if (strpos($rawPage, '#lecture') !== false || strpos($rawPage, 'lecture') !== false) {
                $cleanKey = '#lecture';
                $pageTitle = "Espace Lecteur & Extraits Démo";
            } else if (strpos($rawPage, '#services') !== false || strpos($rawPage, 'services') !== false) {
                $cleanKey = '#services';
                $pageTitle = "Services & Prestations";
            } else if (strpos($rawPage, '#contact') !== false || strpos($rawPage, 'contact') !== false) {
                $cleanKey = '#contact';
                $pageTitle = "Page Contact Mr Ben";
            } else if (strpos($rawPage, '#a-propos') !== false || strpos($rawPage, 'a-propos') !== false) {
                $cleanKey = '#a-propos';
                $pageTitle = "À Propos de Mr Ben";
            }

            if (!isset($pagesBreakdown[$cleanKey])) {
                $pagesBreakdown[$cleanKey] = [
                    'path' => $cleanKey,
                    'name' => $pageTitle,
                    'views' => 0,
                    'visitors' => 0
                ];
            }
            $pagesBreakdown[$cleanKey]['views'] += (int)$row['views'];
            $pagesBreakdown[$cleanKey]['visitors'] = max($pagesBreakdown[$cleanKey]['visitors'], (int)$row['visitors']);
        }

        $totalPViews = max(1, array_sum(array_column($pagesBreakdown, 'views')));
        $pagesDetail = [];
        foreach ($pagesBreakdown as $p) {
            $p['pct'] = round(($p['views'] / $totalPViews) * 100, 1);
            $pagesDetail[] = $p;
        }
        usort($pagesDetail, fn($a, $b) => $b['views'] <=> $a['views']);

        // 6. Détail précis de CHAQUE BOUTON de formation cliqué
        $buttonsMap = [
            'livre-bd-storytelling' => [
                'formationId' => 'livre-bd-storytelling',
                'formationTitle' => "Bandes Dessinées & Storytelling IA",
                'color' => 'purple',
                'totalClicks' => 0,
                'buttons' => [
                    'unlock' => ['id' => 'unlock', 'name' => "Bouton « Débloquer cette formation »", 'count' => 0, 'tag' => 'Déblocage'],
                    'demo' => ['id' => 'demo', 'name' => "Bouton « Lire l'extrait gratuit »", 'count' => 0, 'tag' => 'Lecture Démo'],
                    'fedapay' => ['id' => 'fedapay', 'name' => "Paiement en ligne FedaPay (Mobile Money)", 'count' => 0, 'tag' => 'Paiement Live'],
                    'switch' => ['id' => 'switch', 'name' => "Bouton « Voir formation Vidéos IA »", 'count' => 0, 'tag' => 'Navigation']
                ]
            ],
            'livre-videos-ia' => [
                'formationId' => 'livre-videos-ia',
                'formationTitle' => "Création de Vidéos Virales avec l'IA",
                'color' => 'sky',
                'totalClicks' => 0,
                'buttons' => [
                    'unlock' => ['id' => 'unlock', 'name' => "Bouton « Débloquer cette formation »", 'count' => 0, 'tag' => 'Déblocage'],
                    'demo' => ['id' => 'demo', 'name' => "Bouton « Lire l'extrait gratuit »", 'count' => 0, 'tag' => 'Lecture Démo'],
                    'fedapay' => ['id' => 'fedapay', 'name' => "Paiement en ligne FedaPay (Mobile Money)", 'count' => 0, 'tag' => 'Paiement Live'],
                    'switch' => ['id' => 'switch', 'name' => "Bouton « Voir formation BD »", 'count' => 0, 'tag' => 'Navigation']
                ]
            ],
            'general' => [
                'formationId' => 'general',
                'formationTitle' => "Boutons Globaux & Appels à l'Action",
                'color' => 'amber',
                'totalClicks' => 0,
                'buttons' => [
                    'cta_home' => ['id' => 'cta_home', 'name' => "Bouton Accueil « Débloquer ma formation »", 'count' => 0, 'tag' => 'CTA Accueil'],
                    'vip_code' => ['id' => 'vip_code', 'name' => "Bouton « Débloquer par code d'accès VIP »", 'count' => 0, 'tag' => 'Code VIP'],
                    'services' => ['id' => 'services', 'name' => "Bouton « Nos Services & Prestations »", 'count' => 0, 'tag' => 'Services']
                ]
            ]
        ];

        $stmt = $pdo->query("SELECT 
            event_type, 
            formation_viewed, 
            COUNT(*) as clicks 
        FROM site_visits 
        WHERE $whereClause AND event_type != 'page_view'
        GROUP BY event_type, formation_viewed");

        while ($row = $stmt->fetch()) {
            $evt = strtolower($row['event_type']);
            $fId = $row['formation_viewed'];
            $cnt = (int)$row['clicks'];

            $targetF = 'general';
            if ($fId === 'livre-bd-storytelling' || strpos($evt, '_bd') !== false) {
                $targetF = 'livre-bd-storytelling';
            } else if ($fId === 'livre-videos-ia' || strpos($evt, '_video') !== false || strpos($evt, '_videos') !== false) {
                $targetF = 'livre-videos-ia';
            }

            if (strpos($evt, 'fedapay') !== false || strpos($evt, 'pay') !== false || strpos($evt, 'whatsapp') !== false) {
                $btnKey = ($targetF !== 'general') ? 'fedapay' : 'cta_home';
            } else if (strpos($evt, 'unlock') !== false) {
                $btnKey = 'unlock';
            } else if (strpos($evt, 'demo') !== false) {
                $btnKey = 'demo';
            } else if (strpos($evt, 'switch_video') !== false) {
                $targetF = 'livre-bd-storytelling';
                $btnKey = 'switch';
            } else if (strpos($evt, 'switch_bd') !== false) {
                $targetF = 'livre-videos-ia';
                $btnKey = 'switch';
            } else if (strpos($evt, 'cta_home') !== false) {
                $targetF = 'general';
                $btnKey = 'cta_home';
            } else if (strpos($evt, 'vip') !== false) {
                $targetF = 'general';
                $btnKey = 'vip_code';
            } else if (strpos($evt, 'service') !== false) {
                $targetF = 'general';
                $btnKey = 'services';
            } else {
                $btnKey = 'unlock';
            }

            if (isset($buttonsMap[$targetF]['buttons'][$btnKey])) {
                $buttonsMap[$targetF]['buttons'][$btnKey]['count'] += $cnt;
                $buttonsMap[$targetF]['totalClicks'] += $cnt;
            } else {
                $buttonsMap[$targetF]['buttons'][$btnKey] = [
                    'id' => $btnKey,
                    'name' => "Bouton « " . ucfirst(str_replace(['btn_', '_'], ['', ' '], $evt)) . " »",
                    'count' => $cnt,
                    'tag' => 'Action'
                ];
                $buttonsMap[$targetF]['totalClicks'] += $cnt;
            }
        }

        $formationButtonsDetail = [];
        foreach ($buttonsMap as $f) {
            $f['buttons'] = array_values($f['buttons']);
            $formationButtonsDetail[] = $f;
        }

        // 7. Flux d'activité récent (dernières visites en temps réel)
        $recentVisits = [];
        $stmt = $pdo->query("SELECT visitor_id, country, country_code, device_type, os, formation_viewed, event_type, visited_at FROM site_visits ORDER BY id DESC LIMIT 10");
        while ($row = $stmt->fetch()) {
            $recentVisits[] = [
                'visitorId' => substr($row['visitor_id'], 0, 8),
                'country' => $row['country'],
                'code' => $row['country_code'],
                'device' => $row['device_type'] . ' (' . $row['os'] . ')',
                'event' => $row['event_type'],
                'formation' => $row['formation_viewed'],
                'time' => $row['visited_at']
            ];
        }

        echo json_encode([
            'success' => true,
            'period' => $period,
            'kpis' => [
                'totalViews' => (int)$kpis['total_views'],
                'uniqueVisitors' => (int)$kpis['unique_visitors'],
                'totalInteractions' => (int)$kpis['total_interactions'],
                'unlockClicks' => (int)$kpis['unlock_clicks'],
                'whatsappClicks' => (int)$kpis['whatsapp_clicks'],
                'demoReads' => (int)$kpis['demo_reads']
            ],
            'chartData' => array_values($dailyData),
            'topCountries' => $topCountries,
            'devices' => $devices,
            'pagesDetail' => $pagesDetail,
            'formationButtonsDetail' => $formationButtonsDetail,
            'recentVisits' => $recentVisits
        ]);
        break;

    // -------------------------------------------------------------------------
    // 13. Webhook officiel FedaPay Live (Traitement asynchrone sécurisé)
    // -------------------------------------------------------------------------
    case 'fedapay_webhook':
        $rawPayload = file_get_contents('php://input');
        $event = json_decode($rawPayload, true);
        
        if (!empty($event)) {
            $eventName = $event['name'] ?? '';
            $tx = $event['data'] ?? [];
            $txStatus = $tx['status'] ?? '';

            if ($eventName === 'transaction.approved' || $txStatus === 'approved') {
                $txId = (string)($tx['id'] ?? '');
                $amount = (int)($tx['amount'] ?? 0);
                $customer = $tx['customer'] ?? [];
                $clientEmail = strtolower(trim($customer['email'] ?? ''));
                $clientName = trim(($customer['firstname'] ?? '') . ' ' . ($customer['lastname'] ?? 'Client'));
                $clientPhone = trim($customer['phone_number']['number'] ?? $customer['phone_number'] ?? '');
                
                $metadata = $tx['custom_metadata'] ?? [];
                $itemId = $metadata['bookId'] ?? '';
                if (empty($itemId)) {
                    $desc = strtolower($tx['description'] ?? '');
                    $itemId = strpos($desc, 'video') !== false ? 'livre-videos-ia' : 'livre-bd-storytelling';
                }
                $itemTitle = ($itemId === 'livre-videos-ia') ? "L'Art de Créer des Vidéos Époustouflantes avec l'IA" : "L'Art du Storytelling & BD avec l'IA";
                $promoCode = $metadata['promoCode'] ?? null;
                $orderId = 'ord_feda_' . $txId;
                $code = ($itemId === 'livre-videos-ia' ? 'MB-VID-' : 'MB-BD-') . rand(1000, 9999);
                $date = date('d/m/Y, H:i');

                if (!empty($clientEmail)) {
                    // Vérifier si la commande n'a pas déjà été insérée
                    $checkStmt = $pdo->prepare("SELECT id FROM orders WHERE id = ? OR (client_email = ? AND item_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 1 HOUR))");
                    $checkStmt->execute([$orderId, $clientEmail, $itemId]);
                    $exists = $checkStmt->fetch();

                    if (!$exists) {
                        $insStmt = $pdo->prepare("INSERT INTO orders (
                            id, client_name, client_email, client_phone, item_id, item_title, amount, code, promo_code, discount_amount, payment_method, status, date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'FedaPay Live', 'Actif', ?)");
                        $insStmt->execute([$orderId, $clientName, $clientEmail, $clientPhone, $itemId, $itemTitle, $amount, $code, $promoCode, $date]);

                        $unlockStmt = $pdo->prepare("INSERT IGNORE INTO unlocked_books (email, book_id, book_title, code) VALUES (?, ?, ?, ?)");
                        $unlockStmt->execute([$clientEmail, $itemId, $itemTitle, $code]);

                        // Enregistrer commission promoteur si code promo
                        if (!empty($promoCode)) {
                            $promStmt = $pdo->prepare("SELECT * FROM promoters WHERE UPPER(code_promo) = ?");
                            $promStmt->execute([strtoupper($promoCode)]);
                            $promoter = $promStmt->fetch();
                            if ($promoter) {
                                $commPct = (int)($promoter['commission_pct'] ?? 50);
                                $commAmount = (int)round(($amount * $commPct) / 100);
                                $salesHistory = json_decode($promoter['sales_history'] ?? '[]', true) ?: [];
                                $salesHistory[] = [
                                    'id' => 'sale_' . time(),
                                    'date' => $date,
                                    'orderId' => $orderId,
                                    'bookId' => $itemId,
                                    'bookTitle' => $itemTitle,
                                    'buyerEmail' => $clientEmail,
                                    'paidAmount' => $amount,
                                    'commissionEarned' => $commAmount
                                ];
                                $newSalesCount = (int)($promoter['sales_count'] ?? 0) + 1;
                                $newTotalEarned = (int)($promoter['total_earned'] ?? 0) + $commAmount;

                                $upStmt = $pdo->prepare("UPDATE promoters SET sales_count = ?, total_earned = ?, sales_history = ? WHERE id = ?");
                                $upStmt->execute([$newSalesCount, $newTotalEarned, json_encode($salesHistory), $promoter['id']]);
                            }
                        }
                    }
                }
            }
        }
        http_response_code(200);
        echo json_encode(['received' => true]);
        exit();

    default:
        echo json_encode(['success' => true, 'message' => 'API Mr Ben opérationnelle.']);
        break;
}
