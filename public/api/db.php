<?php
// =============================================================================
// GESTIONNAIRE DE CONNEXION BASE DE DONNÉES (MySQL Hostinger & Fallback SQLite)
// =============================================================================

require_once __DIR__ . '/config.php';

function getDatabaseConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // 1. Tenter la connexion MySQL Hostinger si les identifiants sont renseignés
    if (defined('DB_NAME') && !empty(DB_NAME) && defined('DB_USER') && !empty(DB_USER)) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            return $pdo;
        } catch (PDOException $e) {
            error_log("Erreur connexion MySQL Hostinger: " . $e->getMessage());
        }
    }

    // 2. Base de données autonome (SQLite) intégrée et sécurisée
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
    }
    $sqlitePath = $dataDir . '/mrben_cloud.sqlite';
    $isNew = !file_exists($sqlitePath);

    $pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($isNew) {
        initSqliteTables($pdo);
    }

    return $pdo;
}

function initSqliteTables($pdo) {
    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS unlocked_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            book_id TEXT NOT NULL,
            book_title TEXT DEFAULT '',
            code TEXT DEFAULT '',
            unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(email, book_id)
        )",
        "CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            client_name TEXT DEFAULT '',
            client_email TEXT NOT NULL,
            client_phone TEXT DEFAULT '',
            item_id TEXT NOT NULL,
            item_title TEXT DEFAULT '',
            amount INTEGER NOT NULL DEFAULT 0,
            currency TEXT DEFAULT 'FCFA',
            code TEXT DEFAULT '',
            promo_code TEXT DEFAULT NULL,
            discount_amount INTEGER DEFAULT 0,
            payment_method TEXT DEFAULT 'Mobile Money / Direct',
            status TEXT DEFAULT 'Actif',
            date TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS admin_codes (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            item_id TEXT NOT NULL,
            item_title TEXT DEFAULT '',
            recipient_name TEXT DEFAULT 'Bénéficiaire Privilégié',
            status TEXT DEFAULT 'DISPONIBLE',
            used_by TEXT DEFAULT NULL,
            used_at TEXT DEFAULT NULL,
            blocked_at TEXT DEFAULT NULL,
            created_at TEXT DEFAULT ''
        )",
        "CREATE TABLE IF NOT EXISTS promoters (
            id TEXT PRIMARY KEY,
            nom TEXT DEFAULT '',
            prenom TEXT DEFAULT '',
            code_promo TEXT UNIQUE NOT NULL,
            whatsapp TEXT DEFAULT '',
            target_book_id TEXT DEFAULT 'all',
            reduction_pct INTEGER DEFAULT 20,
            commission_pct INTEGER DEFAULT 50,
            password TEXT DEFAULT '',
            password_set_at TEXT DEFAULT NULL,
            status TEXT DEFAULT 'ACTIF',
            sales_count INTEGER DEFAULT 0,
            total_earned INTEGER DEFAULT 0,
            sales_history TEXT DEFAULT '[]',
            created_at TEXT DEFAULT ''
        )",
        "CREATE TABLE IF NOT EXISTS settings (
            setting_key TEXT PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        "INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES 
        ('formation_prices', '{\"livre-bd-storytelling\":2500,\"livre-videos-ia\":3100}')",
        "INSERT OR IGNORE INTO promoters (
            id, nom, prenom, code_promo, whatsapp, target_book_id, reduction_pct, commission_pct, status, sales_count, total_earned, sales_history, created_at
        ) VALUES (
            'prom_ben200', 'LOKO', 'Mr Ben', 'BEN200', '2290199728385', 'all', 20, 50, 'ACTIF', 0, 0, '[]', '21/10/2026, 14:00'
        )"
    ];

    foreach ($queries as $q) {
        try {
            $pdo->exec($q);
        } catch (Exception $e) {
            error_log("Erreur init SQLite: " . $e->getMessage());
        }
    }
}
