<?php
// =============================================================================
// MODULE SMTP AUTONOME SANS DÉPENDANCE EXTERNE POUR HOSTINGER & GMAIL
// =============================================================================

function sendSmtpMail($to, $subject, $htmlMessage, $altText = '') {
    // Vérification de la configuration
    if (!defined('SMTP_HOST') || empty(SMTP_HOST) || !defined('SMTP_USER') || empty(SMTP_USER) || !defined('SMTP_PASS') || empty(SMTP_PASS)) {
        // Fallback si SMTP non encore configuré
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
        $headers[] = 'From: ' . (defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'Mr Ben Formations') . ' <' . (defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : 'no-reply@gpower-store.com') . '>';
        $headers[] = 'Reply-To: ' . (defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : 'contact@gpower-store.com');
        $headers[] = 'X-Mailer: PHP/' . phpversion();
        $ok = @mail($to, $subject, $htmlMessage, implode("\r\n", $headers));
        return [
            'success' => $ok,
            'fallback' => true,
            'error' => $ok ? null : "Échec de l'envoi mail() standard. Veuillez configurer les identifiants SMTP dans public/api/config.php."
        ];
    }

    $host = SMTP_HOST;
    $port = defined('SMTP_PORT') ? (int)SMTP_PORT : 465;
    $user = SMTP_USER;
    $pass = SMTP_PASS;
    $secure = defined('SMTP_SECURE') ? strtolower(SMTP_SECURE) : ($port === 465 ? 'ssl' : 'tls');
    $fromEmail = defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : $user;
    $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'Mr Ben Formations';

    $timeout = 15;
    $errno = 0;
    $errstr = '';

    // Détermination de l'adresse de connexion socket
    $remoteSocket = ($secure === 'ssl') ? "ssl://{$host}:{$port}" : "tcp://{$host}:{$port}";

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($remoteSocket, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        return [
            'success' => false,
            'error' => "Connexion impossible au serveur SMTP {$host}:{$port} ($errstr [code $errno])"
        ];
    }

    stream_set_timeout($socket, $timeout);

    $readResponse = function() use ($socket) {
        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            // La dernière ligne d'une réponse SMTP a un espace après le code à 3 chiffres (ex: "250 OK\r\n")
            if (strlen($line) >= 4 && substr($line, 3, 1) === ' ') {
                break;
            }
        }
        return $response;
    };

    $sendCommand = function($cmd) use ($socket, $readResponse) {
        fputs($socket, $cmd . "\r\n");
        return $readResponse();
    };

    // 1. Lire la bannière d'accueil SMTP
    $welcome = $readResponse();
    if (substr($welcome, 0, 3) !== '220') {
        fclose($socket);
        return ['success' => false, 'error' => "Bannière SMTP invalide : {$welcome}"];
    }

    // 2. EHLO
    $clientDomain = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'gpower-store.com';
    $ehlo = $sendCommand("EHLO {$clientDomain}");

    // 3. STARTTLS si configuré sur port 587
    if ($secure === 'tls') {
        $starttls = $sendCommand("STARTTLS");
        if (substr($starttls, 0, 3) !== '220') {
            fclose($socket);
            return ['success' => false, 'error' => "STARTTLS refusé : {$starttls}"];
        }
        $crypto = stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        if (!$crypto) {
            fclose($socket);
            return ['success' => false, 'error' => "Échec de l'initialisation du chiffrement TLS."];
        }
        // Ré-envoyer EHLO après STARTTLS
        $ehlo = $sendCommand("EHLO {$clientDomain}");
    }

    // 4. Authentification (AUTH LOGIN)
    $auth = $sendCommand("AUTH LOGIN");
    if (substr($auth, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "AUTH LOGIN non supporté : {$auth}"];
    }

    // Envoyer le nom d'utilisateur base64
    $resUser = $sendCommand(base64_encode($user));
    if (substr($resUser, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "Utilisateur SMTP rejeté : {$resUser}"];
    }

    // Envoyer le mot de passe base64
    $resPass = $sendCommand(base64_encode($pass));
    if (substr($resPass, 0, 3) !== '235') {
        fclose($socket);
        return ['success' => false, 'error' => "Identifiants SMTP invalides (mot de passe incorrect) : {$resPass}"];
    }

    // 5. MAIL FROM
    $mailFrom = $sendCommand("MAIL FROM:<{$fromEmail}>");
    if (substr($mailFrom, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejeté : {$mailFrom}"];
    }

    // 6. RCPT TO
    $rcptTo = $sendCommand("RCPT TO:<{$to}>");
    if (substr($rcptTo, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "Destinataire {$to} rejeté : {$rcptTo}"];
    }

    // 7. DATA
    $dataCmd = $sendCommand("DATA");
    if (substr($dataCmd, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA rejeté : {$dataCmd}"];
    }

    // En-têtes du courriel selon standard RFC 2822
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [];
    $headers[] = "From: {$encodedFromName} <{$fromEmail}>";
    $headers[] = "To: <{$to}>";
    $headers[] = "Reply-To: <{$fromEmail}>";
    $headers[] = "Subject: {$encodedSubject}";
    $headers[] = "Date: " . date('r');
    $headers[] = "Message-ID: <" . md5(uniqid(microtime(), true)) . "@{$clientDomain}>";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: base64";
    $headers[] = "X-Mailer: MrBen-Mailer/2.0";

    $rawContent = implode("\r\n", $headers) . "\r\n\r\n";
    $rawContent .= chunk_split(base64_encode($htmlMessage), 76, "\r\n");
    $rawContent .= "\r\n.";

    $sendData = $sendCommand($rawContent);
    $sendCommand("QUIT");
    fclose($socket);

    if (substr($sendData, 0, 3) === '250') {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => "Échec de l'envoi du message : {$sendData}"];
    }
}
