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

    let navigationData = []; // Store parsed navigation for re-rendering

    /**
     * Initialization
     */
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
            const opt1 = new Option(font, font);
            const opt2 = new Option(font, font);
            fontSidebarSelect.add(opt1);
            fontContentSelect.add(opt2);
        });
    }

    /**
     * Settings & Theme
     */
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

        // Update UI
        fontSidebarSelect.value = currentSettings.fontSidebar;
        fontContentSelect.value = currentSettings.fontContent;
        fontSizeSidebarInput.value = currentSettings.fontSizeSidebar;
        fontSizeContentInput.value = currentSettings.fontSizeContent;
        
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === currentSettings.viewMode);
        });
        sidebarContent.className = `sidebar-content view-${currentSettings.viewMode}`;

        themeOptions.forEach(opt => opt.classList.toggle('active', opt.getAttribute('data-theme-val') === currentSettings.theme));

        // Dynamic Font Loading
        const fontsToLoad = [currentSettings.fontSidebar, currentSettings.fontContent].filter(f => f !== 'Inter');
        if (fontsToLoad.length > 0) {
            const fontQuery = Array.from(new Set(fontsToLoad)).map(f => f.replace(/ /g, '+')).join('|');
            document.getElementById('dynamic-fonts').href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700&display=swap`;
        }
    }

    /**
     * Resizer Logic
     */
    function setupResizer() {
        let isResizing = false;
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = Math.min(Math.max(e.clientX, 200), 500);
            currentSettings.sidebarWidth = newWidth;
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
                saveSettingsState();
            }
        });
    }

    /**
     * View Switching
     */
    function setupViewSwitching() {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-view');
                currentSettings.viewMode = mode;
                applySettings();
                renderSidebar(navigationData);
                saveSettingsState();
            });
        });
    }

    /**
     * Navigation & Rendering
     */
    async function loadNavigation() {
        try {
            const response = await fetch('navigation.md');
            const text = await response.text();
            
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

            renderSidebar(navigationData);
            
            const firstItem = document.querySelector('.nav-item');
            if (firstItem) firstItem.click();

        } catch (e) {
            sidebarContent.innerHTML = '<div style="padding:20px;">Erreur navigation.md</div>';
        }
    }

    function renderSidebar(sections) {
        sidebarContent.innerHTML = '';
        sections.forEach(section => {
            const header = document.createElement('div');
            header.className = 'nav-section-header';
            header.textContent = section.name;
            sidebarContent.appendChild(header);

            const tree = buildTree(section.items);
            renderTree(tree, sidebarContent);
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

    function renderTree(nodes, container) {
        Object.values(nodes).forEach(node => {
            const group = document.createElement('div');
            group.className = 'nav-group';
            
            if (node.isFolder) {
                const folder = document.createElement('div');
                folder.className = 'nav-folder';
                folder.innerHTML = `<i data-lucide="chevron-down"></i><span>${node.name}</span>`;
                
                const children = document.createElement('div');
                children.className = 'nav-children';
                
                folder.addEventListener('click', () => {
                    children.classList.toggle('hidden');
                    folder.classList.toggle('collapsed');
                });

                group.appendChild(folder);
                group.appendChild(children);
                renderTree(node.children, children);
            } else {
                const item = document.createElement('div');
                item.className = 'nav-item';
                item.textContent = node.name;
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadMarkdown(node.path, item);
                    if (window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');
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
            markdownContent.innerHTML = '<h1>Erreur</h1>';
        } finally {
            loader.style.display = 'none';
            markdownContent.style.opacity = '1';
        }
    }

    /**
     * Settings Actions
     */
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
