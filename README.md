# OTP Generator - Extension Navigateur

Un générateur d'OTP (One-Time Password) sécurisé et convivial, compatible avec tous les navigateurs modernes, permettant de gérer facilement vos codes d'authentification à deux facteurs.

## 🌐 Compatibilité

### Navigateurs supportés
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Opera
- ✅ Firefox
- ✅ Safari
- ✅ Brave
- ✅ Vivaldi

> Note: L'extension utilise le stockage local du navigateur pour une compatibilité maximale.

## 🚀 Démarrage Rapide

1. **Installation**
   ```bash
   git clone https://github.com/DelsarteDorian/OTP-Generator.git
   ```
   
   ### Tous les navigateurs
   - Ouvrez le navigateur et allez dans la section extensions :
     - Chrome/Edge/Brave : `chrome://extensions/`
     - Firefox : `about:addons`
     - Opera : `opera://extensions`
     - Safari : Préférences > Extensions
   - Activez le "Mode développeur" ou "Développement"
   - Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier de l'extension

2. **Première utilisation**
   - Mot de passe par défaut : `admin`
   - Changez-le immédiatement après la première connexion

## 📱 Guide d'utilisation

### 1. Gestion des OTPs

#### Ajouter un OTP
1. Cliquez sur "Add OTP"
2. Remplissez les champs :
   - **Service** : Nom du service (ex: Google, GitHub)
   - **Secret** : Clé secrète fournie par le service
   - **Algorithme** : TOTP (basé sur le temps) ou HOTP (basé sur un compteur)
   - **Catégorie** : Optionnel, pour organiser vos OTPs

#### Utiliser un OTP
- Cliquez sur le code pour le copier
- Le code se régénère automatiquement toutes les 30 secondes
- Utilisez le bouton "Repair" si le code ne fonctionne pas

### 2. Organisation

#### Catégories
- Créez des catégories personnalisées
- Filtrez les OTPs par catégorie
- Réorganisez par glisser-déposer

#### Tri et Filtrage
- Utilisez le menu déroulant pour filtrer par catégorie
- Glissez-déposez les OTPs pour les réorganiser
- Les modifications sont sauvegardées automatiquement

### 3. Sécurité

#### Protection
- Mot de passe maître obligatoire
- Chiffrement AES des données
- Session de 1 heure
- Authentification à deux facteurs optionnelle

#### Stockage
- Données stockées localement dans le navigateur
- Chiffrement des données sensibles
- Pas de synchronisation entre appareils
- Limite de stockage : ~5-10 MB

#### Import/Export
- Exportez vos OTPs en format chiffré
- Importez des sauvegardes existantes
- Format compatible uniquement avec l'extension

## 🔧 Fonctionnalités avancées

### Mode sombre
- Basculez entre les thèmes clair et sombre
- Préférence sauvegardée automatiquement

### Gestion des sessions
- Déconnexion automatique après 1 heure
- Reconnexion rapide avec le mot de passe

### 2FA (Optionnel)
1. Activez la 2FA dans les paramètres
2. Scannez le QR code avec votre application d'authentification
3. Entrez le code pour vérifier

## 💾 Sauvegarde et restauration

### Export
1. Cliquez sur "Export"
2. Un fichier `otp_backup.json` sera téléchargé
3. Conservez ce fichier en lieu sûr

### Import
1. Cliquez sur "Import"
2. Sélectionnez votre fichier de sauvegarde
3. Les OTPs seront restaurés automatiquement

## 🛠️ Développement

### Structure du projet
```
otp-generator/
├── manifest.json    # Configuration de l'extension
├── popup.html      # Interface utilisateur
├── popup.js        # Logique principale
├── styles.css      # Styles et thèmes
└── icons/          # Icônes de l'extension
    └── logo.png
```

## 🔐 Sécurité et confidentialité

- Toutes les données sont chiffrées localement
- Aucune donnée n'est envoyée à des serveurs externes
- Les clés secrètes restent sur votre appareil
- Session automatique pour la sécurité
- Stockage local sécurisé

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 👤 Auteur

Dorian Delsarte ([@DelsarteDorian](https://github.com/DelsarteDorian)) 