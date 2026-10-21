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
            initMysqlTables($pdo);
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

function initMysqlTables($pdo) {
    static $initialized = false;
    if ($initialized) return;

    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(191) NOT NULL UNIQUE,
            name VARCHAR(191) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS unlocked_books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(191) NOT NULL,
            book_id VARCHAR(64) NOT NULL,
            book_title VARCHAR(255) DEFAULT '',
            code VARCHAR(64) DEFAULT '',
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_book (email, book_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(64) PRIMARY KEY,
            client_name VARCHAR(191) DEFAULT '',
            client_email VARCHAR(191) NOT NULL,
            client_phone VARCHAR(64) DEFAULT '',
            item_id VARCHAR(64) NOT NULL,
            item_title VARCHAR(255) DEFAULT '',
            amount INT NOT NULL DEFAULT 0,
            currency VARCHAR(16) DEFAULT 'FCFA',
            code VARCHAR(64) DEFAULT '',
            promo_code VARCHAR(64) DEFAULT NULL,
            discount_amount INT DEFAULT 0,
            payment_method VARCHAR(64) DEFAULT 'Mobile Money / Direct',
            status VARCHAR(32) DEFAULT 'Actif',
            date VARCHAR(64) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS admin_codes (
            id VARCHAR(64) PRIMARY KEY,
            code VARCHAR(64) NOT NULL UNIQUE,
            item_id VARCHAR(64) NOT NULL,
            item_title VARCHAR(255) DEFAULT '',
            recipient_name VARCHAR(191) DEFAULT 'Bénéficiaire Privilégié',
            status VARCHAR(32) DEFAULT 'DISPONIBLE',
            used_by VARCHAR(191) DEFAULT NULL,
            used_at VARCHAR(64) DEFAULT NULL,
            blocked_at VARCHAR(64) DEFAULT NULL,
            created_at VARCHAR(64) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS promoters (
            id VARCHAR(64) PRIMARY KEY,
            nom VARCHAR(128) DEFAULT '',
            prenom VARCHAR(128) DEFAULT '',
            code_promo VARCHAR(64) NOT NULL UNIQUE,
            whatsapp VARCHAR(64) DEFAULT '',
            target_book_id VARCHAR(64) DEFAULT 'all',
            reduction_pct INT DEFAULT 20,
            commission_pct INT DEFAULT 50,
            password VARCHAR(255) DEFAULT '',
            password_set_at VARCHAR(64) DEFAULT NULL,
            status VARCHAR(32) DEFAULT 'ACTIF',
            sales_count INT DEFAULT 0,
            total_earned INT DEFAULT 0,
            sales_history TEXT,
            created_at VARCHAR(64) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(64) PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
        ('formation_prices', '{\"livre-bd-storytelling\":2500,\"livre-videos-ia\":3100}')",

        "INSERT IGNORE INTO promoters (
            id, nom, prenom, code_promo, whatsapp, target_book_id, reduction_pct, commission_pct, status, sales_count, total_earned, sales_history, created_at
        ) VALUES (
            'prom_ben200', 'LOKO', 'Mr Ben', 'BEN200', '2290199728385', 'all', 20, 50, 'ACTIF', 0, 0, '[]', '21/10/2026, 14:00'
        )"
    ];

    foreach ($queries as $q) {
        try {
            $pdo->exec($q);
        } catch (Exception $e) {
            error_log("Erreur init MySQL: " . $e->getMessage());
        }
    }

    $initialized = true;
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
