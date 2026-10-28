<?php
// =============================================================================
// CONFIGURATION DE LA BASE DE DONNÉES HOSTINGER (MR BEN)
// =============================================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'u268450082_formation');
define('DB_USER', 'u268450082_formation');
define('DB_PASS', 'Benbd2000');

// =============================================================================
// CONFIGURATION FEDAPAY LIVE (COMPTE BUSINESS BEN OF GOD)
// =============================================================================
define('FEDAPAY_PUBLIC_KEY', 'pk_live_2qqHt1RLs2WwN4Wf9sXvwU6u');
define('FEDAPAY_SECRET_KEY', 'sk_live_Qc7yI9_iVAVSQavN8vmsL52u');
define('FEDAPAY_ENVIRONMENT', 'live');

// =============================================================================
// CONFIGURATION SERVEUR SMTP (HOSTINGER / GMAIL) POUR ENVOI D'E-MAILS RÉELS
// =============================================================================
// Pour Hostinger : smtp.hostinger.com (Port 465 SSL)
// Pour Gmail     : smtp.gmail.com (Port 465 SSL, avec Mot de Passe d'Application)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 465);
define('SMTP_SECURE', 'ssl');
define('SMTP_USER', ''); // Ex: contact@gpower-store.com ou mrbenofficiel6@gmail.com
define('SMTP_PASS', ''); // Mot de passe du compte mail ou Mot de passe d'application Gmail
define('SMTP_FROM_EMAIL', ''); // Adresse expéditeur (souvent identique à SMTP_USER)
define('SMTP_FROM_NAME', 'Mr Ben — Formations IA');

