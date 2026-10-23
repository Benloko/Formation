import ftplib
import os
import sys
import json
import time

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
                        print(f"    ⚠️ Erreur création dossier '{item}': {e}")
                _walk(l_item)
                ftp.cwd('..')

    _walk(local_dist)
    return uploaded

def main():
    server = os.environ.get('FTP_SERVER')
    username = os.environ.get('FTP_USERNAME')
    password = os.environ.get('FTP_PASSWORD')

    if not server or not username or not password:
        print("❌ Erreur : Secrets FTP manquants.")
        sys.exit(1)

    print(f"🚀 Connexion FTP à {server}...")
    ftp = ftplib.FTP(server, timeout=60)
    ftp.login(username, password)
    ftp.set_pasv(True)

    start_dir = ftp.pwd()
    print(f"📂 Répertoire de base FTP : {start_dir}")

    # Création du fichier de diagnostic dans dist
    local_dist = "./dist"
    diag_file = os.path.join(local_dist, "deploy_info.json")
    diag_data = {
        "deployed_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "commit": os.environ.get("GITHUB_SHA", "unknown")[:7],
        "status": "ready"
    }
    with open(diag_file, "w") as f:
        json.dump(diag_data, f, indent=2)

    # Liste des emplacements candidats potentiels sur Hostinger
    candidates = [
        "",
        "formation",
        "public_html/formation",
        "domains/gpower-store.com/public_html/formation",
        "domains/gpower-store.com/public_html",
        "public_html"
    ]

    target_dirs = []
    print("\n🔍 Analyse des répertoires sur le serveur Hostinger...")
    for c in candidates:
        try:
            ftp.cwd(start_dir)
            if c:
                ftp.cwd(c)
            items = ftp.nlst()
            basenames = [os.path.basename(i.rstrip('/')) for i in items]
            if "index.html" in basenames or "assets" in basenames or "api" in basenames:
                print(f"  🎯 Répertoire actif détecté avec site existant : '{c or '.'}'")
                target_dirs.append(c)
        except Exception:
            pass

    if not target_dirs:
        # Si aucun n'a été détecté avec certitude, on déploie sur les répertoires standards
        print("⚠️ Aucun index.html existant repéré, utilisation des chemins par défaut.")
        target_dirs = ["formation", "domains/gpower-store.com/public_html/formation"]

    print(f"\n📦 Déploiement vers {len(target_dirs)} emplacement(s) cible(s) : {target_dirs}")

    for target in target_dirs:
        ftp.cwd(start_dir)
        print(f"\n➡️ Déploiement en cours dans : '{target or '.'}'")
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
                        print(f"  ⚠️ Erreur dossier {part}: {e}")

        count = upload_directory_tree(ftp, local_dist)
        print(f"  ✅ {count} fichiers téléversés dans '{target or '.'}'")

    print("\n🎉 Tous les déploiements se sont terminés avec succès !")
    ftp.quit()

if __name__ == '__main__':
    main()
