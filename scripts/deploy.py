import ftplib
import os
import sys

def main():
    server = os.environ.get('FTP_SERVER')
    username = os.environ.get('FTP_USERNAME')
    password = os.environ.get('FTP_PASSWORD')

    if not server or not username or not password:
        print("❌ Erreur : Secrets FTP manquants (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD).")
        sys.exit(1)

    print(f"🚀 Connexion FTP à {server} avec l'utilisateur {username}...")
    ftp = ftplib.FTP(server, timeout=60)
    ftp.login(username, password)
    ftp.set_pasv(True)
    
    current_dir = ftp.pwd()
    print(f"📂 Répertoire de départ FTP (PWD) : {current_dir}")
    
    try:
        root_items = ftp.nlst()
        print(f"📄 Contenu du répertoire de départ : {root_items}")
    except Exception as e:
        root_items = []
        print(f"⚠️ Impossible de lister le répertoire de départ : {e}")

    # Détection automatique du bon chemin sur Hostinger
    target_dir = None
    
    # Cas 1 : L'utilisateur FTP pointe déjà directement sur le dossier du site
    if 'index.html' in root_items or 'assets' in root_items:
        print("✅ Détection : Le compte FTP pointe déjà directement sur la racine du site !")
        target_dir = ""
    # Cas 2 : Dossier 'formation' présent à la racine
    elif 'formation' in root_items:
        # Vérifions si 'formation' contient index.html ou assets
        try:
            sub = ftp.nlst('formation')
            print(f"🔍 Contenu de 'formation' : {sub}")
            target_dir = "formation"
        except Exception:
            target_dir = "formation"
    # Cas 3 : Arborescence Hostinger standard 'domains'
    elif 'domains' in root_items:
        target_dir = "domains/gpower-store.com/public_html/formation"
    # Cas 4 : Arborescence 'public_html'
    elif 'public_html' in root_items:
        target_dir = "public_html/formation"
    else:
        # Repli par défaut
        target_dir = "formation"

    print(f"🎯 Répertoire cible retenu pour le déploiement : '{target_dir or '.'}'")

    if target_dir:
        # Assurer que le dossier cible existe et y entrer
        dirs = [d for d in target_dir.split('/') if d]
        for d in dirs:
            try:
                ftp.cwd(d)
            except Exception:
                try:
                    ftp.mkd(d)
                    ftp.cwd(d)
                except Exception as err:
                    print(f"⚠️ Erreur lors de l'accès/création du dossier {d}: {err}")
    
    print(f"📍 Répertoire FTP final actif : {ftp.pwd()}")
    print("Contenu actuel dans ce répertoire cible :")
    try:
        ftp.dir()
    except Exception:
        pass

    # Déploiement des fichiers depuis ./dist
    local_dist = "./dist"
    if not os.path.exists(local_dist):
        print("❌ Erreur : Le dossier ./dist n'existe pas. Compilez d'abord avec npm run build.")
        sys.exit(1)

    print("\n📦 Téléversement de tous les fichiers de ./dist...")
    uploaded_count = 0

    def upload_dir(local_path):
        nonlocal uploaded_count
        for item in os.listdir(local_path):
            l_item = os.path.join(local_path, item)
            if os.path.isfile(l_item):
                with open(l_item, 'rb') as f:
                    ftp.storbinary(f"STOR {item}", f)
                    uploaded_count += 1
                    print(f"  ⬆️ {os.path.relpath(l_item, local_dist)}")
            elif os.path.isdir(l_item):
                try:
                    ftp.cwd(item)
                except Exception:
                    try:
                        ftp.mkd(item)
                        ftp.cwd(item)
                    except Exception as e:
                        print(f"⚠️ Erreur création dossier {item}: {e}")
                upload_dir(l_item)
                ftp.cwd('..')

    upload_dir(local_dist)
    print(f"\n🎉 Déploiement terminé avec succès ! {uploaded_count} fichiers téléversés.")
    ftp.quit()

if __name__ == '__main__':
    main()
