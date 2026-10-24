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

        // Tarifs
        $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = 'formation_prices'");
        $stmt->execute();
        $pricesRow = $stmt->fetch();
        $prices = [
            'livre-bd-storytelling' => 2500,
            'livre-videos-ia' => 3100
        ];
        if ($pricesRow && !empty($pricesRow['setting_value'])) {
            $decodedPrices = json_decode($pricesRow['setting_value'], true);
            if (is_array($decodedPrices)) {
                $prices = array_merge($prices, $decodedPrices);
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
        $stmt = $pdo->prepare("UPDATE promoters SET password = ?, password_set_at = ?, email = CASE WHEN ? != '' THEN ? ELSE email END, payout_phone = CASE WHEN ? != '' THEN ? ELSE payout_phone END WHERE id = ?");
        $stmt->execute([$password, $now, $email, $email, $payoutPhone, $payoutPhone, $promoterId]);

        // Retourner le promoteur mis à jour
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

        echo json_encode(['success' => true, 'promoter' => $p]);
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

        $stmt = $pdo->prepare("UPDATE promoters SET email = CASE WHEN ? != '' THEN ? ELSE email END, payout_phone = CASE WHEN ? != '' THEN ? ELSE payout_phone END WHERE id = ?");
        $stmt->execute([$email, $email, $payoutPhone, $payoutPhone, $promoterId]);

        echo json_encode(['success' => true]);
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

        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
        $headers[] = 'From: Mr Ben Formations <no-reply@gpower-store.com>';
        $headers[] = 'Reply-To: contact@gpower-store.com';
        $headers[] = 'X-Mailer: PHP/' . phpversion();

        // Envoi réel
        $mailSuccess = @mail($targetEmail, $subject, $htmlMessage, implode("\r\n", $headers));

        // Masquer l'adresse pour l'affichage (ex: be***@gmail.com)
        $emailParts = explode('@', $targetEmail);
        $userPart = $emailParts[0];
        $maskedUser = strlen($userPart) <= 2 ? $userPart : substr($userPart, 0, 2) . str_repeat('*', max(2, strlen($userPart) - 2));
        $maskedEmail = $maskedUser . '@' . ($emailParts[1] ?? 'gmail.com');

        echo json_encode([
            'success' => true,
            'message' => "Un code de confirmation a été envoyé sur votre Gmail.",
            'maskedEmail' => $maskedEmail,
            'mailSent' => $mailSuccess
        ]);
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
        if (!empty($prices)) {
            $json = json_encode($prices);
            $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('formation_prices', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            try {
                $stmt->execute([$json, $json]);
            } catch (Exception $e) {
                // SQLite syntax fallback
                $stmt = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES ('formation_prices', ?)");
                $stmt->execute([$json]);
            }
            echo json_encode(['success' => true, 'prices' => $prices]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Données de prix manquantes.']);
        }
        break;

    default:
        echo json_encode(['success' => true, 'message' => 'API Mr Ben opérationnelle.']);
        break;
}
