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
