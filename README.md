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

## ⚙️ Personnalisation (`config.json`)

Le fichier `config.json` permet de modifier :
- **GitHub** : Votre pseudo et le nom du dépôt à explorer.
- **Identité** : Nom d'affichage, Bio, et Titre de l'onglet (`siteTitle`).
- **Footer** : Personnalisez le texte en bas de page.
- **Réseaux Sociaux** : Plus de 20 plateformes supportées (Twitter, X, Discord, TikTok, etc.).
- **Favicon** : Utilisez votre propre icône ou laissez vide pour votre photo GitHub.

## 🚀 Déploiement sur GitHub Pages

1. Créez un nouveau dépôt sur GitHub.
2. Activez **GitHub Pages** dans les paramètres du dépôt.
3. Poussez le contenu du dossier `dist/` sur la branche `main` ou `gh-pages`.
4. Votre hub est en ligne !

---
**Powered By Nexgen - "Fluent Github5ai" (v1.0)**
