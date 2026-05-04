# Obsidian Web Reader 🚀

Une interface web élégante, fluide et responsive pour lire votre vault Obsidian directement dans votre navigateur.

![Preview](https://via.placeholder.com/800x450?text=Obsidian+Web+Reader+Preview)

## ✨ Caractéristiques

- **3 Modes de Vue** : Explorateur (arbre), Cascade (imbriqué) et Liste simple.
- **Thèmes Personnalisables** : Dark, Dim, et Light.
- **Typographie Flexible** : Changez la police et la taille du texte pour la barre latérale et le contenu indépendamment.
- **Responsive Design** : Optimisé pour mobile, tablette et desktop.
- **Navigation Intelligente** : Supporte un fichier de navigation personnalisé ou une détection automatique.

## 📂 Navigation

L'application utilise deux méthodes pour afficher vos notes :

### 1. Mode Manuel (`navigation.md`)
Créez un fichier `navigation.md` à la racine pour organiser vos notes manuellement :
```markdown
# INTRODUCTION
- notes/bienvenue.md
- notes/guide.md

# PROJETS
- notes/projets/projet-a.md
```

### 2. Mode Automatique (Fallback)
Si `navigation.md` est absent ou vide, l'application tentera de :
1. Lire le fichier `files.json` (une simple liste JSON de chemins).
2. Scanner le dossier `notes/` (si votre serveur supporte l'indexation).

## 🛠️ Installation & Usage

1. Copiez les fichiers sur votre serveur web ou utilisez un serveur local (ex: `npx serve`).
2. Placez vos notes dans le dossier `notes/`.
3. (Optionnel) Configurez votre `navigation.md`.

## 📱 Mobile & Tablette
La barre latérale est rétractable. Sur mobile, vous pouvez continuer à lire votre contenu tout en naviguant dans le menu grâce à une interface semi-transparente sans effet de flou obstruant.

---
Développé avec ❤️ pour la communauté Obsidian.
