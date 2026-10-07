# GUIDE COMPLET DE DÉPLOIEMENT HOSTINGER - IFP-ITMC (ifp-itmc.com)
**Centre & Institut de Formation Professionnelle - Douala Logpom (Carrefour Bassong), Cameroun**

Ce guide vous accompagne pas à pas pour déployer l'intégralité de la plateforme sur votre hébergement **Hostinger** (Formule Cloud, VPS ou Hébergement Web Professionnel avec Node.js).

---

## 1. Prérequis sur votre compte Hostinger
1. **Nom de domaine actif** : `ifp-itmc.com` configuré sur Hostinger avec DNS pointant vers votre serveur.
2. **Accès au panneau Hostinger (hPanel)**.
3. **Accès Node.js** (via le gestionnaire d'applications Node.js de Hostinger ou Terminal SSH / VPS).
4. **Base de données MySQL / MariaDB** avec accès phpMyAdmin.

---

## 2. Configuration de la Base de Données MySQL Sécurisée sur Hostinger

1. Rendez-vous dans **hPanel > Bases de données MySQL**.
2. Créez une nouvelle base de données sécurisée :
   - **Nom de la base** : `u123456789_itmc_prod`
   - **Utilisateur MySQL** : `u123456789_itmc_user`
   - **Mot de passe** : Choisissez un mot de passe fort (ex: 20+ caractères aléatoires avec chiffres et symboles).
3. Ouvrez **phpMyAdmin** pour cette base.
4. Cliquez sur l'onglet **Importer** (Import).
5. Sélectionnez le fichier `schema_hostinger.sql` situé à la racine du projet.
6. Cliquez sur **Exécuter** (Go).
   - Toutes les tables sécurisées (`users`, `academic_years`, `students`, `teachers`, `classes`, `specialties`, `grades`, `institution_branding`, `security_logs`) sont automatiquement créées avec leurs index et contraintes.

---

## 3. Configuration des Variables d'Environnement (`.env`)

Créez ou éditez le fichier `.env` à la racine de votre projet sur Hostinger :

```env
# Mode Production
NODE_ENV=production
PORT=3000

# Clé secrète cryptographique de session (générez une chaîne longue aléatoire)
SESSION_SECRET=cfp-itmc-super-secret-cryptographic-key-2026-douala-production-hostinger-secure

# Paramètres de la Base de Données Hostinger MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_itmc_prod
DB_USER=u123456789_itmc_user
DB_PASSWORD=VotreMotDePasseMySQLTresSecurise

# Clé API Google Gemini (pour l'assistant IA CFP-ITMC)
GEMINI_API_KEY=votre_cle_gemini_securisee

# Domaine Officiel et SEO
PUBLIC_URL=https://ifp-itmc.com
```

---

## 4. Compilation et Déploiement

### Option A : Déploiement via le Gestionnaire Node.js de Hostinger (hPanel)
1. Téléversez les fichiers de votre projet (via le Gestionnaire de Fichiers ou Git).
2. Dans **hPanel > Gestionnaire d'applications Node.js** :
   - **Version Node.js** : Sélectionnez **Node 20 LTS** ou **Node 22 LTS**.
   - **Application Root** : `/home/u123456789/domains/ifp-itmc.com/public_html`
   - **Application Startup File** : `dist/server.cjs`
   - **Mode** : Production
3. Lancez l'installation et le build :
   ```bash
   npm install
   npm run build
   ```
4. Cliquez sur **Démarrer l'application** (Start Application).

### Option B : Déploiement sur Serveur VPS Hostinger (Ubuntu / Debian avec PM2 & Nginx)
1. Connectez-vous en SSH à votre VPS Hostinger :
   ```bash
   ssh root@votre_ip_vps
   ```
2. Installez Node.js 20 LTS et PM2 :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs nginx git
   npm install -g pm2
   ```
3. Clonez ou copiez votre code dans `/var/www/ifp-itmc.com` :
   ```bash
   cd /var/www/ifp-itmc.com
   npm install
   npm run build
   ```
4. Démarrez le serveur avec PM2 pour un redémarrage automatique en cas de panne :
   ```bash
   pm2 start dist/server.cjs --name "ifp-itmc"
   pm2 save
   pm2 startup
   ```
5. Configurez le reverse-proxy Nginx avec certificat SSL Let's Encrypt :
   ```nginx
   server {
       server_name ifp-itmc.com www.ifp-itmc.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
6. Activez SSL gratuit en 1 clic :
   ```bash
   certbot --nginx -d ifp-itmc.com -d www.ifp-itmc.com
   ```

---

## 5. Gestion et Personnalisation du Logo par le Super Admin
- Rendez-vous sur votre espace Super Admin : `https://ifp-itmc.com/dashboard/settings`
- Naviguez vers l'onglet **"Identité Visuelle & Logo Officiel de l'Institut"**.
- Vous pouvez :
  1. Glisser-déposer votre nouveau logo (PNG, SVG, JPG, WebP transparent).
  2. Saisir une URL d'image de logo externe.
  3. Prévisualiser le rendu en temps réel sur la Navbar, la Sidebar et les Bulletins officiels.
  4. Cliquer sur **"Enregistrer & Appliquer Partout"**.
  - Le logo est immédiatement synchronisé et diffusé sur l'ensemble de la plateforme (Landing page, entêtes, bas de page, relevés officiels et espaces pédagogiques).

---

## 6. Vérification du Référencement Google (SEO Douala Logpom)
- Le fichier `robots.txt` est accessible sur `https://ifp-itmc.com/robots.txt`.
- Le sitemap XML est disponible sur `https://ifp-itmc.com/sitemap.xml`.
- Soumettez le sitemap sur **Google Search Console** :
  `https://search.google.com/search-console` -> Ajouter la propriété `https://ifp-itmc.com` -> Soumettre `sitemap.xml`.
- Google indexera automatiquement vos formations avec les coordonnées précises de **Douala - Logpom (Carrefour Bassong)** et vos 39 spécialités DQP.
