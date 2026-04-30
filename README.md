# 🚀 Fluent Github5ai

**Fluent Github5ai** est un hub de partage de fichiers statique, moderne et hautement personnalisable, conçu pour transformer n'importe quel dépôt GitHub en un explorateur de fichiers élégant avec une identité visuelle forte.

![Preview](https://github.com/nexgen999.png)

## ✨ Caractéristiques

- 📁 **Explorateur de Fichiers Dynamique** : Parcourez vos fichiers GitHub avec une interface fluide et rapide.
- 📥 **Téléchargement Direct** : Les fichiers se téléchargent directement en un clic.
- 👤 **Profil Social Intégré** : Affichez votre identité GitHub et vos liens vers plus de 20 réseaux sociaux.
- 🎨 **Design "Twitter Dim"** : Une esthétique sobre, sombre et professionnelle.
- ⚙️ **Configuration Zero-Code** : Modifiez simplement un fichier `config.json` pour personnaliser tout le site (pas besoin de recompiler !).
- 🖼️ **Dashboard Icons** : Intégration d'icônes PNG de haute qualité pour tous vos réseaux.
- 📦 **Support Multi-Dépôts** : Explorez plusieurs dépôts ou dossiers différents depuis une seule interface.
- 📱 **Full Responsive** : Optimisé pour mobile, tablette et desktop.

## 🛠️ Installation & Configuration

### Pour les utilisateurs (Mode Archive)
Si vous avez reçu l'archive compilée (`dist/`) :
1. Ouvrez le fichier `config.json` à la racine.
2. Modifiez vos informations (pseudo GitHub, dépôt, liens sociaux).
3. Enregistrez le fichier.
4. Hébergez le contenu du dossier sur n'importe quel serveur statique (GitHub Pages, Netlify, Vercel).

### Pour les développeurs
1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
4. Compilez pour la production :
   ```bash
   npm run build
   ```

## ⚙️ Personnalisation Globale (`config.json`)

Le fichier `config.json` (à la racine) contient toute la logique de votre hub. Voici un guide pour chaque section :

### 1. Identité & GitHub
- **`githubUsername`** : Votre nom d'utilisateur GitHub. Sert à récupérer votre photo de profil.
- **`githubRepo`** : Le dépôt GitHub principal que vous souhaitez explorer par défaut.
- **`displayName`** : Votre nom affiché en haut à gauche.
- **`bio`** : Une courte description de vous ou de votre projet.
- **`siteTitle`** : Le texte qui apparaîtra dans l'onglet de votre navigateur.
- **`footerText`** : Le texte personnalisé en bas de l'explorateur.

### 2. Réseaux Sociaux (`socials`)
Remplissez simplement l'URL de votre profil. Si vous laissez une valeur vide `""`, l'icône sera masquée.
- **Supports** : Facebook, Instagram, Bluesky, Twitter, X (Twitter), Snapchat, Discord, Messenger, WhatsApp, Telegram, YouTube, TikTok, Twitch, Kick, LinkedIn, Email, GitHub, GitLab, Gitea, Forgejo.

### 3. Sources Multi-Dépôts (`sources`)
Vous pouvez lier plusieurs dossiers provenant de n'importe quel dépôt GitHub public.
Chaque source nécessite :
- **`id`** : Identifiant unique (sans espaces).
- **`name`** : Nom de l'onglet affiché dans le hub.
- **`owner`** : Le pseudo GitHub du propriétaire du dépôt cible.
- **`repo`** : Le nom du dépôt cible.
- **`path`** : Le dossier spécifique à l'intérieur du dépôt à explorer.

**Exemple concret :**
```json
"sources": [
  {
    "id": "mon-depot",
    "name": "Mes Fichiers",
    "owner": "nexgen999",
    "repo": "mon-depot-perso",
    "path": "distribution/v1"
  }
]
```

### 4. Apparence
- **`favicon`** : Nom du fichier image placé dans `assets/favicon/` (ex: `my_icon.png`). Laissez vide pour utiliser votre photo GitHub.
- **`theme`** : Le thème visuel (par défaut `"dim"`).

## 🚀 Déploiement sur GitHub Pages

1. Créez un nouveau dépôt sur GitHub.
2. Activez **GitHub Pages** dans les paramètres du dépôt.
3. Poussez le contenu du dossier `dist/` sur la branche `main` ou `gh-pages`.
4. Votre hub est en ligne !

---
**Powered By Nexgen - "Fluent Github5ai" ( v1.1 multi-sources )**
