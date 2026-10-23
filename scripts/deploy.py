import ftplib
import os
import sys
import json
import time
import urllib.request

LOGS = []

def log(msg):
    print(msg)
    LOGS.append(str(msg))

def send_telemetry():
    try:
        report = "\n".join(LOGS)
        req = urllib.request.Request(
            "https://ntfy.sh/mrben_deploy_test_9934",
            data=report.encode("utf-8"),
            headers={"Title": "Rapport Déploiement Mr Ben (Absolu)", "Priority": "default"}
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Telemetry error: {e}")

def upload_directory_tree(ftp, local_dist):
    uploaded = 0

    def _walk(local_path):
        nonlocal uploaded
        for item in os.listdir(local_path):
            l_item = os.path.join(local_path, item)
            if os.path.isfile(l_item):
                with open(l_item, 'rb') as f:
                    ftp.storbinary(f"STOR {item}", f)
                    uploaded += 1
            elif os.path.isdir(l_item):
                try:
                    ftp.cwd(item)
                except Exception:
                    try:
                        ftp.mkd(item)
                        ftp.cwd(item)
                    except Exception as e:
                        log(f"    ⚠️ Erreur création dossier '{item}': {e}")
                _walk(l_item)
                ftp.cwd('..')

    _walk(local_dist)
    return uploaded

def main():
    server = os.environ.get('FTP_SERVER')
    username = os.environ.get('FTP_USERNAME')
    password = os.environ.get('FTP_PASSWORD')

    if not server or not username or not password:
        log("❌ Erreur : Secrets FTP manquants.")
        send_telemetry()
        sys.exit(1)

    log(f"🚀 Connexion FTP à {server} (User: {username})...")
    ftp = ftplib.FTP(server, timeout=60)
    ftp.login(username, password)
    ftp.set_pasv(True)

    log(f"📂 Répertoire de connexion par défaut : {ftp.pwd()}")

    # Vérification de la racine absolue /
    try:
        ftp.cwd('/')
        log(f"🌐 Navigation vers la racine absolue / réussie. PWD : {ftp.pwd()}")
        root_items = ftp.nlst()
        log(f"📄 Contenu à la racine absolue / : {root_items}")
    except Exception as e:
        log(f"⚠️ Erreur accès racine / : {e}")

    # Préparation du diagnostic
    local_dist = "./dist"
    diag_file = os.path.join(local_dist, "deploy_info.json")
    diag_data = {
        "deployed_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "commit": os.environ.get("GITHUB_SHA", "unknown")[:7],
        "status": "ready"
    }
    with open(diag_file, "w") as f:
        json.dump(diag_data, f, indent=2)

    # Chemins absolus Hostinger à cibler
    absolute_targets = [
        "/domains/gpower-store.com/public_html/formation",
        "/domains/gpower-store.com/formation",
        "/public_html/formation",
        "/formation"
    ]

    log(f"\n📦 Déploiement vers les répertoires cibles absolus : {absolute_targets}")

    success_targets = []
    for target in absolute_targets:
        try:
            ftp.cwd(target)
            current_target = ftp.pwd()
            log(f"\n➡️ CWD réussi dans '{current_target}' ! Début téléversement...")
            count = upload_directory_tree(ftp, local_dist)
            log(f"  ✅ {count} fichiers téléversés dans '{current_target}'")
            success_targets.append(current_target)
        except Exception as e:
            log(f"  ❌ Impossible d'accéder ou téléverser dans '{target}': {e}")

    log(f"\n🎉 Déploiement terminé ! Dossiers mis à jour : {success_targets}")
    ftp.quit()

    # Test HTTP direct en ligne
    time.sleep(3)
    try:
        test_url = "https://formation.gpower-store.com/api/index.php?action=where_am_i"
        log(f"\n🌐 Test en direct du endpoint live : {test_url}")
        req = urllib.request.Request(test_url, headers={"User-Agent": "DeployTester/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8', errors='ignore')
            log(f"Réponse en direct du serveur Hostinger : {body}")
    except Exception as err:
        log(f"⚠️ Erreur test live : {err}")

    send_telemetry()

if __name__ == '__main__':
    main()
