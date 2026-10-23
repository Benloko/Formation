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
            headers={"Title": "Rapport Déploiement Mr Ben", "Priority": "default"}
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

    start_dir = ftp.pwd()
    log(f"📂 Répertoire racine de connexion FTP : {start_dir}")

    # Lister le contenu du dossier racine de connexion
    root_lines = []
    try:
        ftp.dir(root_lines.append)
        log(f"📄 Contenu brut du dossier de départ :\n" + "\n".join(root_lines[:15]))
    except Exception as e:
        log(f"⚠️ Erreur listing racine : {e}")

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

    # Recherche récursive de l'arborescence des dossiers
    all_dirs = []
    def explore(path, depth=0):
        if depth > 3:
            return
        all_dirs.append(path)
        try:
            ftp.cwd(path if path else start_dir)
            lines = []
            ftp.dir(lines.append)
            for line in lines:
                parts = line.split()
                if line.startswith('d') and len(parts) >= 9:
                    dname = parts[-1]
                    if dname not in ('.', '..'):
                        sub = f"{path}/{dname}" if path else dname
                        explore(sub, depth + 1)
        except Exception:
            pass

    log("\n🔍 Exploration de l'arborescence du serveur...")
    explore("", 0)
    log(f"📁 Dossiers découverts sur le serveur : {all_dirs}")

    # Identifier où se trouve le site actif (où se trouvent déjà index.html, robots.txt ou assets)
    target_dirs = []
    for d in all_dirs:
        try:
            ftp.cwd(start_dir)
            if d:
                ftp.cwd(d)
            items = ftp.nlst()
            bnames = [os.path.basename(i.rstrip('/')) for i in items]
            if "robots.txt" in bnames or "index.html" in bnames or "assets" in bnames or "vite.svg" in bnames:
                log(f"🎯 SITE ACTIF DÉTECTÉ DANS : '{d or '.'}'")
                target_dirs.append(d)
        except Exception:
            pass

    if not target_dirs:
        # Si aucune détection précise, on cible les chemins clés
        log("⚠️ Aucun index.html ou robots.txt existant repéré, repli sur dossiers clés.")
        for d in all_dirs:
            if "formation" in d.lower():
                target_dirs.append(d)
        if not target_dirs:
            target_dirs = [""]

    log(f"\n📦 Déploiement des nouveaux fichiers vers : {target_dirs}")

    for target in target_dirs:
        ftp.cwd(start_dir)
        log(f"\n➡️ Téléversement vers '{target or '.'}'...")
        if target:
            for part in target.split('/'):
                if not part:
                    continue
                try:
                    ftp.cwd(part)
                except Exception:
                    try:
                        ftp.mkd(part)
                        ftp.cwd(part)
                    except Exception as e:
                        log(f"  ⚠️ Erreur dossier {part}: {e}")

        count = upload_directory_tree(ftp, local_dist)
        log(f"  ✅ {count} fichiers téléversés dans '{target or '.'}'")

    log("\n🎉 Déploiement terminé avec succès !")
    ftp.quit()
    send_telemetry()

if __name__ == '__main__':
    main()
