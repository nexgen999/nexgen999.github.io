document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    const markdownContent = document.getElementById('markdown-content');
    const loader = document.getElementById('loader');
    const modalOverlay = document.getElementById('modal-overlay');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // UI elements
    const mobileToggle = document.getElementById('mobile-toggle');
    const openSettings = document.getElementById('open-settings');
    const openSettingsMobile = document.getElementById('open-settings-mobile');
    const closeSettings = document.getElementById('close-settings');
    const saveSettings = document.getElementById('save-settings');
    
    // Settings inputs
    const fontSidebarInput = document.getElementById('font-sidebar-input');
    const fontContentInput = document.getElementById('font-content-input');
    const fontSizeInput = document.getElementById('font-size-input');
    const themeOptions = document.querySelectorAll('.theme-option');

    let currentSettings = { theme: 'dark', fontSidebar: 'Inter', fontContent: 'Inter', fontSize: 16 };

    // Initialize Marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) return Prism.highlight(code, Prism.languages[lang], lang);
            return code;
        },
        breaks: true,
        gfm: true
    });

    /**
     * Settings & Theme Logic
     */
    function loadSettings() {
        const saved = localStorage.getItem('obsidian-reader-settings');
        if (saved) currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        applySettings();
    }

    function applySettings() {
        document.documentElement.setAttribute('data-theme', currentSettings.theme);
        document.documentElement.style.setProperty('--font-sidebar', `"${currentSettings.fontSidebar}", sans-serif`);
        document.documentElement.style.setProperty('--font-content', `"${currentSettings.fontContent}", sans-serif`);
        document.documentElement.style.setProperty('--font-size-content', `${currentSettings.fontSize}px`);

        if (currentSettings.fontSidebar || currentSettings.fontContent) {
            const fontLink = document.getElementById('dynamic-fonts');
            const fonts = [currentSettings.fontSidebar, currentSettings.fontContent].filter(f => f && f !== 'Inter');
            if (fonts.length > 0) {
                const fontQuery = fonts.map(f => f.replace(/ /g, '+')).join('|');
                fontLink.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;600&display=swap`;
            }
        }

        themeOptions.forEach(opt => opt.classList.toggle('active', opt.getAttribute('data-theme-val') === currentSettings.theme));
        fontSidebarInput.value = currentSettings.fontSidebar;
        fontContentInput.value = currentSettings.fontContent;
        fontSizeInput.value = currentSettings.fontSize;
    }

    /**
     * Path-to-Tree Logic
     */
    async function loadNavigation() {
        try {
            const response = await fetch('navigation.md');
            if (!response.ok) throw new Error('navigation.md not found');
            const text = await response.text();
            
            const lines = text.split('\n');
            const sections = [];
            let currentSection = null;

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;

                if (trimmed.startsWith('# ')) {
                    currentSection = { name: trimmed.replace('# ', ''), items: [] };
                    sections.push(currentSection);
                } else if (trimmed.startsWith('- ') && currentSection) {
                    const path = trimmed.replace('- ', '');
                    currentSection.items.push(path);
                }
            });

            renderSidebar(sections);
            lucide.createIcons();

            // Auto-load first file
            const firstItem = document.querySelector('.nav-item');
            if (firstItem) firstItem.click();

        } catch (error) {
            console.error('Error:', error);
            sidebarContent.innerHTML = '<div style="padding: 20px; color: var(--accent-color);">Erreur de chargement.</div>';
        }
    }

    function renderSidebar(sections) {
        sidebarContent.innerHTML = '';
        sections.forEach(section => {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'nav-section-header';
            sectionHeader.textContent = section.name;
            sidebarContent.appendChild(sectionHeader);

            const tree = buildTree(section.items);
            renderTree(tree, sidebarContent);
        });
    }

    function buildTree(paths) {
        const root = { children: {} };
        paths.forEach(path => {
            const parts = path.split('/');
            let current = root;
            parts.forEach((part, index) => {
                if (!current.children[part]) {
                    current.children[part] = { 
                        name: part.replace('.md', ''), 
                        path: index === parts.length - 1 ? path : null,
                        isFolder: index < parts.length - 1,
                        children: {} 
                    };
                }
                current = current.children[part];
            });
        });
        return root.children;
    }

    function renderTree(nodes, container) {
        Object.values(nodes).forEach(node => {
            if (node.isFolder) {
                const group = document.createElement('div');
                group.className = 'nav-group';
                
                const folder = document.createElement('div');
                folder.className = 'nav-folder';
                folder.innerHTML = `<i data-lucide="chevron-down"></i><span>${node.name}</span>`;
                
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'nav-children';
                
                folder.addEventListener('click', () => {
                    childrenContainer.classList.toggle('hidden');
                    folder.classList.toggle('collapsed');
                });

                group.appendChild(folder);
                group.appendChild(childrenContainer);
                container.appendChild(group);
                renderTree(node.children, childrenContainer);
            } else {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item';
                navItem.textContent = node.name;
                navItem.setAttribute('data-path', node.path);
                
                navItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadMarkdown(node.path, navItem);
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth <= 1024) toggleSidebar(false);
                });
                
                container.appendChild(navItem);
            }
        });
    }

    async function loadMarkdown(path, navElement) {
        loader.style.display = 'block';
        markdownContent.style.opacity = '0.5';
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        navElement.classList.add('active');

        try {
            const response = await fetch(path);
            const mdText = await response.text();
            markdownContent.innerHTML = marked.parse(mdText);
            Prism.highlightAllUnder(markdownContent);
            document.querySelector('main').scrollTop = 0;
        } catch (error) {
            markdownContent.innerHTML = `<h1>Erreur</h1><p>Impossible de charger <code>${path}</code></p>`;
        } finally {
            loader.style.display = 'none';
            markdownContent.style.opacity = '1';
        }
    }

    /**
     * Mobile Interaction
     */
    function toggleSidebar(show) {
        sidebar.classList.toggle('open', show);
        sidebarOverlay.classList.toggle('open', show);
    }

    mobileToggle.addEventListener('click', () => toggleSidebar(true));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    /**
     * Modal Events
     */
    const openSet = () => modalOverlay.style.display = 'flex';
    openSettings.addEventListener('click', openSet);
    openSettingsMobile.addEventListener('click', openSet);
    closeSettings.addEventListener('click', () => modalOverlay.style.display = 'none');
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.style.display = 'none'; });

    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            themeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentSettings.theme = opt.getAttribute('data-theme-val');
        });
    });

    saveSettings.addEventListener('click', () => {
        currentSettings.fontSidebar = fontSidebarInput.value || 'Inter';
        currentSettings.fontContent = fontContentInput.value || 'Inter';
        currentSettings.fontSize = parseInt(fontSizeInput.value) || 16;
        localStorage.setItem('obsidian-reader-settings', JSON.stringify(currentSettings));
        applySettings();
        modalOverlay.style.display = 'none';
    });

    loadSettings();
    loadNavigation();
});
