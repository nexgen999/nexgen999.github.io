# Obsidian Web Reader 🚀

An elegant, fluid, and responsive web interface to read your Obsidian vault directly in your browser.

![Preview](https://via.placeholder.com/800x450?text=Obsidian+Web+Reader+Preview)

## ✨ Features

- **3 View Modes**: Explorer (tree), Cascade (nested), and Simple List.
- **Custom Themes**: Dark, Dim, and Light.
- **Flexible Typography**: Change font family and size for the sidebar and content independently.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Smart Navigation**: Supports a custom navigation file or automatic detection.

## 📂 Navigation

The application uses two methods to display your notes:

### 1. Manual Mode (`navigation.md`)
Create a `navigation.md` file in the root to organize your notes manually:
```markdown
# INTRODUCTION
- notes/welcome.md
- notes/guide.md

# PROJECTS
- notes/projects/project-a.md
```

### 2. Automatic Mode (Fallback)
If `navigation.md` is missing or empty, the app will try to:
1. Read the `files.json` file (a simple JSON list of paths).
2. Scan the `notes/` folder (if your server supports directory indexing).

## 🛠️ Installation & Usage

1. Copy the files to your web server or use a local server (e.g., `npx serve`).
2. Place your notes in the `notes/` folder.
3. (Optional) Configure your `navigation.md`.

## 📱 Mobile & Tablet
The sidebar is retractable. On mobile, you can continue reading your content while browsing the menu thanks to a clean, non-obstructive interface.

---
Developed with ❤️ for the Obsidian community.
