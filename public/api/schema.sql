-- =============================================================================
-- STRUCTURE OFFICIELLE DE LA BASE DE DONNÉES MR BEN (MySQL / MariaDB Hostinger)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS unlocked_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  book_id VARCHAR(64) NOT NULL,
  book_title VARCHAR(255) DEFAULT '',
  code VARCHAR(64) DEFAULT '',
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_book (email, book_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_client_email (client_email),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_codes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  item_id VARCHAR(64) NOT NULL,
  item_title VARCHAR(255) DEFAULT '',
  recipient_name VARCHAR(191) DEFAULT 'Bénéficiaire Privilégié',
  status VARCHAR(32) DEFAULT 'DISPONIBLE', -- 'DISPONIBLE', 'UTILISÉ', 'BLOQUÉ'
  used_by VARCHAR(191) DEFAULT NULL,
  used_at VARCHAR(64) DEFAULT NULL,
  blocked_at VARCHAR(64) DEFAULT NULL,
  created_at VARCHAR(64) DEFAULT '',
  INDEX idx_code (code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promoters (
  id VARCHAR(64) PRIMARY KEY,
  nom VARCHAR(191) DEFAULT '',
  prenom VARCHAR(191) DEFAULT '',
  code_promo VARCHAR(64) NOT NULL UNIQUE,
  whatsapp VARCHAR(64) DEFAULT '',
  target_book_id VARCHAR(64) DEFAULT 'all',
  reduction_pct INT DEFAULT 20,
  commission_pct INT DEFAULT 50,
  password VARCHAR(255) DEFAULT '',
  password_set_at VARCHAR(64) DEFAULT NULL,
  status VARCHAR(32) DEFAULT 'ACTIF', -- 'ACTIF', 'BLOQUÉ'
  sales_count INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  sales_history LONGTEXT DEFAULT NULL,
  created_at VARCHAR(64) DEFAULT '',
  INDEX idx_code_promo (code_promo),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des tarifs par défaut
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('formation_prices', '{"livre-bd-storytelling":2500,"livre-videos-ia":3100}');

-- Insertion du code promo officiel universel Mr Ben BEN200
INSERT IGNORE INTO promoters (
  id, nom, prenom, code_promo, whatsapp, target_book_id, reduction_pct, commission_pct, status, sales_count, total_earned, sales_history, created_at
) VALUES (
  'prom_ben200', 'LOKO', 'Mr Ben', 'BEN200', '2290199728385', 'all', 20, 50, 'ACTIF', 0, 0, '[]', '21/10/2026, 14:00'
);
