document.addEventListener('DOMContentLoaded', () => {
    const sidebarContent = document.getElementById('sidebar-content');
    const markdownContent = document.getElementById('markdown-content');
    const loader = document.getElementById('loader');

    // Initialize Marked options
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        },
        breaks: true,
        gfm: true
    });

    /**
     * Parse navigation.md
     * Expects format:
     * # Folder Name
     * - File Path/Name.md
     */
    async function loadNavigation() {
        try {
            const response = await fetch('navigation.md');
            if (!response.ok) throw new Error('navigation.md not found');
            const text = await response.text();
            
            const lines = text.split('\n');
            let currentHtml = '';
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                if (trimmedLine.startsWith('# ')) {
                    // Folder Header
                    const folderName = trimmedLine.replace('# ', '');
                    currentHtml += `<div class="nav-folder">${folderName}</div>`;
                } else if (trimmedLine.startsWith('- ')) {
                    // File Item
                    const filePath = trimmedLine.replace('- ', '');
                    const fileName = filePath.split('/').pop().replace('.md', '');
                    currentHtml += `
                        <div class="nav-item" data-path="${filePath}">
                            <i data-lucide="file-text"></i>
                            <span>${fileName}</span>
                        </div>
                    `;
                }
            });

            sidebarContent.innerHTML = currentHtml;
            lucide.createIcons();

            // Add click listeners
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const path = item.getAttribute('data-path');
                    loadMarkdown(path, item);
                });
            });

            // Load first file by default if available
            const firstItem = document.querySelector('.nav-item');
            if (firstItem) {
                firstItem.click();
            }

        } catch (error) {
            console.error('Error loading navigation:', error);
            sidebarContent.innerHTML = '<div style="padding: 20px; color: #ff5f5f;">Error: navigation.md not found or invalid.</div>';
        }
    }

    async function loadMarkdown(path, navElement) {
        loader.style.display = 'block';
        markdownContent.style.opacity = '0.5';
        
        // Update UI
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        navElement.classList.add('active');

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('File not found');
            const mdText = await response.text();
            
            // Render
            markdownContent.innerHTML = marked.parse(mdText);
            
            // Re-highlight code blocks
            Prism.highlightAllUnder(markdownContent);
            
            // Scroll to top
            document.querySelector('main').scrollTop = 0;
            
        } catch (error) {
            console.error('Error loading markdown:', error);
            markdownContent.innerHTML = `<h1 style="color: #ff5f5f;">Error</h1><p>Could not load the file at: <code>${path}</code></p>`;
        } finally {
            loader.style.display = 'none';
            markdownContent.style.opacity = '1';
        }
    }

    loadNavigation();
});
