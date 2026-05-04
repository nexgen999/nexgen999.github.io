document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    const markdownContent = document.getElementById('markdown-content');
    const loader = document.getElementById('loader');
    const modalOverlay = document.getElementById('modal-overlay');
    const resizeHandle = document.getElementById('resize-handle');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    const fontSidebarSelect = document.getElementById('font-sidebar-select');
    const fontContentSelect = document.getElementById('font-content-select');
    const fontSizeSidebarInput = document.getElementById('font-size-sidebar');
    const fontSizeContentInput = document.getElementById('font-size-content');
    const themeOptions = document.querySelectorAll('.theme-option');

    const professionalFonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
        'Source Sans Pro', 'Noto Sans', 'Oswald', 'Raleway', 
        'Merriweather', 'Playfair Display', 'Lora', 'PT Sans', 
        'Ubuntu', 'Mukta', 'Nunito', 'Titillium Web', 
        'Quicksand', 'Heebo', 'Work Sans'
    ];

    let currentSettings = {
        theme: 'dark',
        fontSidebar: 'Inter',
        fontContent: 'Inter',
        fontSizeSidebar: 14,
        fontSizeContent: 16,
        viewMode: 'explorer',
        sidebarWidth: 280
    };

    let navigationData = [];

    function init() {
        populateFontDropdowns();
        loadSettings();
        setupResizer();
        setupViewSwitching();
        loadNavigation();
        lucide.createIcons();
    }

    function populateFontDropdowns() {
        professionalFonts.forEach(font => {
            fontSidebarSelect.add(new Option(font, font));
            fontContentSelect.add(new Option(font, font));
        });
    }

    function loadSettings() {
        const saved = localStorage.getItem('obsidian-web-reader-settings');
        if (saved) currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        applySettings();
    }

    function applySettings() {
        document.documentElement.setAttribute('data-theme', currentSettings.theme);
        document.documentElement.style.setProperty('--sidebar-width', `${currentSettings.sidebarWidth}px`);
        document.documentElement.style.setProperty('--font-sidebar', `"${currentSettings.fontSidebar}", sans-serif`);
        document.documentElement.style.setProperty('--font-content', `"${currentSettings.fontContent}", sans-serif`);
        document.documentElement.style.setProperty('--font-size-sidebar', `${currentSettings.fontSizeSidebar}px`);
        document.documentElement.style.setProperty('--font-size-content', `${currentSettings.fontSizeContent}px`);

        fontSidebarSelect.value = currentSettings.fontSidebar;
        fontContentSelect.value = currentSettings.fontContent;
        fontSizeSidebarInput.value = currentSettings.fontSizeSidebar;
        fontSizeContentInput.value = currentSettings.fontSizeContent;
        
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === currentSettings.viewMode);
        });
        sidebarContent.className = `sidebar-content view-${currentSettings.viewMode}`;

        themeOptions.forEach(opt => opt.classList.toggle('active', opt.getAttribute('data-theme-val') === currentSettings.theme));

        const fontsToLoad = [currentSettings.fontSidebar, currentSettings.fontContent].filter(f => f !== 'Inter');
        if (fontsToLoad.length > 0) {
            const fontQuery = Array.from(new Set(fontsToLoad)).map(f => f.replace(/ /g, '+')).join('|');
            document.getElementById('dynamic-fonts').href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700&display=swap`;
        }
    }

    /**
     * Resizer Logic - Optimized for fluidity
     */
    function setupResizer() {
        let isResizing = false;
        let animationFrame = null;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            if (animationFrame) cancelAnimationFrame(animationFrame);
            
            animationFrame = requestAnimationFrame(() => {
                const newWidth = Math.min(Math.max(e.clientX, 200), 500);
                currentSettings.sidebarWidth = newWidth;
                document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
            });
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('resizing');
                document.body.style.cursor = 'default';
                saveSettingsState();
            }
        });
    }

    function setupViewSwitching() {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing sidebar if event bubbles
                const oldMode = currentSettings.viewMode;
                currentSettings.viewMode = btn.getAttribute('data-view');
                
                // Save currently open folders to restore them
                const openFolders = Array.from(document.querySelectorAll('.nav-folder:not(.collapsed)')).map(f => f.innerText.trim());
                
                applySettings();
                renderSidebar(navigationData, openFolders);
                saveSettingsState();
            });
        });
    }

    async function loadNavigation() {
        try {
            const response = await fetch('navigation.md');
            if (!response.ok) throw new Error('navigation.md non trouvé');
            
            const text = await response.text();
            if (!text.trim()) throw new Error('navigation.md est vide');

            const lines = text.split('\n');
            navigationData = [];
            let currentSection = null;

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;
                if (trimmed.startsWith('# ')) {
                    currentSection = { name: trimmed.replace('# ', ''), items: [] };
                    navigationData.push(currentSection);
                } else if (trimmed.startsWith('- ') && currentSection) {
                    currentSection.items.push(trimmed.replace('- ', ''));
                }
            });

            if (navigationData.length === 0) throw new Error('Aucune section trouvée');

            renderSidebar(navigationData);
            selectFirstItem();
        } catch (e) {
            console.warn("Échec du chargement de navigation.md, passage au mode automatique...", e);
            await tryFallbackNavigation();
        }
    }

    async function tryFallbackNavigation() {
        try {
            // Priority 1: Try files.json
            const response = await fetch('files.json');
            if (response.ok) {
                const files = await response.json();
                navigationData = [{ name: "VAULT CONTENT", items: files }];
                renderSidebar(navigationData);
                selectFirstItem();
                return;
            }

            // Priority 2: Try to guess directory listing (experimental)
            const dirResponse = await fetch('notes/');
            if (dirResponse.ok) {
                const html = await dirResponse.text();
                // Basic regex to find links to .md files in an HTML directory listing
                const matches = [...html.matchAll(/href="([^"]+\.md)"/gi)];
                const files = matches.map(m => `notes/${m[1]}`);
                if (files.length > 0) {
                    navigationData = [{ name: "AUTO SCAN", items: files }];
                    renderSidebar(navigationData);
                    selectFirstItem();
                    return;
                }
            }
            
            throw new Error('Aucun fichier de navigation trouvé');
        } catch (e) {
            sidebarContent.innerHTML = '<div style="padding:20px; color:var(--text-muted); font-size:0.8rem;">Créez un fichier <b>navigation.md</b> ou <b>files.json</b> pour voir vos notes.</div>';
            markdownContent.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><h3>Bienvenue sur Obsidian Web Reader</h3><p>Veuillez configurer votre navigation pour commencer.</p></div>';
        } finally {
            loader.style.display = 'none';
        }
    }

    function selectFirstItem() {
        const firstItem = document.querySelector('.nav-item');
        if (firstItem) firstItem.click();
    }

    function renderSidebar(sections, openFolders = []) {
        sidebarContent.innerHTML = '';
        if (!sections || sections.length === 0) return;
        
        sections.forEach(section => {
            const header = document.createElement('div');
            header.className = 'nav-section-header';
            header.textContent = section.name;
            sidebarContent.appendChild(header);

            const tree = buildTree(section.items);
            renderTree(tree, sidebarContent, openFolders);
        });
        lucide.createIcons();
    }

    function buildTree(paths) {
        const root = { children: {} };
        paths.forEach(path => {
            const parts = path.split('/');
            let cur = root;
            parts.forEach((part, i) => {
                if (!cur.children[part]) {
                    cur.children[part] = { 
                        name: part.replace('.md', ''), 
                        parentName: i > 0 ? parts[i-1] : '',
                        path: i === parts.length - 1 ? path : null,
                        isFolder: i < parts.length - 1,
                        children: {} 
                    };
                }
                cur = cur.children[part];
            });
        });
        return root.children;
    }

    function renderTree(nodes, container, openFolders = []) {
        Object.values(nodes).forEach(node => {
            const group = document.createElement('div');
            group.className = 'nav-group';
            
            if (node.isFolder) {
                const folder = document.createElement('div');
                folder.className = 'nav-folder';
                
                // Restore state
                const isExpanded = openFolders.includes(node.name) || openFolders.length === 0;
                if (!isExpanded) folder.classList.add('collapsed');

                folder.innerHTML = `<i data-lucide="chevron-down"></i><span>${node.name}</span>`;
                
                const children = document.createElement('div');
                children.className = 'nav-children';
                if (!isExpanded) children.classList.add('hidden');
                
                folder.addEventListener('click', (e) => {
                    e.stopPropagation();
                    children.classList.toggle('hidden');
                    folder.classList.toggle('collapsed');
                });

                group.appendChild(folder);
                group.appendChild(children);
                renderTree(node.children, children, openFolders);
            } else {
                const item = document.createElement('div');
                item.className = 'nav-item';
                
                // Add folder hint for List view
                if (currentSettings.viewMode === 'list' && node.parentName) {
                    const hint = document.createElement('span');
                    hint.className = 'folder-hint';
                    hint.textContent = node.parentName;
                    item.appendChild(hint);
                }
                
                const name = document.createElement('span');
                name.textContent = node.name;
                item.appendChild(name);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadMarkdown(node.path, item);
                    // Close sidebar on mobile after clicking a file
                    if (window.innerWidth <= 1024) {
                        sidebar.classList.remove('open');
                        document.getElementById('sidebar-overlay').classList.remove('open');
                    }
                });
                group.appendChild(item);
            }
            container.appendChild(group);
        });
    }

    async function loadMarkdown(path, navElement) {
        loader.style.display = 'block';
        markdownContent.style.opacity = '0.4';
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        navElement.classList.add('active');

        try {
            const response = await fetch(path);
            const text = await response.text();
            markdownContent.innerHTML = marked.parse(text);
            Prism.highlightAllUnder(markdownContent);
            document.querySelector('main').scrollTop = 0;
        } catch (e) {
            markdownContent.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <h3>Erreur de lecture</h3>
                    <p style="margin-top:10px; font-size:0.9rem;">Si vous utilisez Chrome localement, l'accès aux fichiers peut être bloqué.</p>
                    <p style="margin-top:15px; font-size:0.8rem; opacity:0.7;">Solution : Utilisez un serveur local (ex: <code>npx serve</code>) ou autorisez l'accès aux fichiers dans Chrome.</p>
                </div>`;
        } finally {
            loader.style.display = 'none';
            markdownContent.style.opacity = '1';
        }
    }

    function saveSettingsState() {
        localStorage.setItem('obsidian-web-reader-settings', JSON.stringify(currentSettings));
    }

    document.getElementById('open-settings').addEventListener('click', () => modalOverlay.style.display = 'flex');
    document.getElementById('open-settings-mobile').addEventListener('click', () => modalOverlay.style.display = 'flex');
    document.getElementById('close-settings').addEventListener('click', () => modalOverlay.style.display = 'none');
    
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            currentSettings.theme = opt.getAttribute('data-theme-val');
            applySettings();
        });
    });

    document.getElementById('save-settings').addEventListener('click', () => {
        currentSettings.fontSidebar = fontSidebarSelect.value;
        currentSettings.fontContent = fontContentSelect.value;
        currentSettings.fontSizeSidebar = parseInt(fontSizeSidebarInput.value);
        currentSettings.fontSizeContent = parseInt(fontSizeContentInput.value);
        saveSettingsState();
        applySettings();
        modalOverlay.style.display = 'none';
    });

    // Mobile Toggle
    document.getElementById('mobile-toggle').addEventListener('click', () => {
        sidebar.classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('open');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        sidebar.classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });

    init();
});
