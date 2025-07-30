// Terminal Web Application
class TermuxWeb {
    constructor() {
        this.currentSession = 1;
        this.sessions = new Map();
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentDirectory = '/home/user';
        this.fileSystem = this.initializeFileSystem();
        this.packages = this.initializePackages();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupTerminal();
        this.setupTheme();
        this.createSession(1);
    }

    // Initialize virtual file system
    initializeFileSystem() {
        return {
            '/': {
                type: 'directory',
                children: {
                    'home': {
                        type: 'directory',
                        children: {
                            'user': {
                                type: 'directory',
                                children: {
                                    'documents': { type: 'directory', children: {} },
                                    'downloads': { type: 'directory', children: {} },
                                    'projects': { type: 'directory', children: {} },
                                    'welcome.txt': { 
                                        type: 'file', 
                                        content: 'Welcome to Termux Web Terminal!\nThis is a browser-based terminal emulator.\n' 
                                    }
                                }
                            }
                        }
                    },
                    'bin': {
                        type: 'directory',
                        children: {
                            'ls': { type: 'executable' },
                            'cd': { type: 'executable' },
                            'pwd': { type: 'executable' },
                            'cat': { type: 'executable' },
                            'mkdir': { type: 'executable' },
                            'touch': { type: 'executable' },
                            'rm': { type: 'executable' },
                            'help': { type: 'executable' },
                            'clear': { type: 'executable' },
                            'echo': { type: 'executable' },
                            'date': { type: 'executable' },
                            'whoami': { type: 'executable' },
                            'uname': { type: 'executable' }
                        }
                    },
                    'etc': { type: 'directory', children: {} },
                    'tmp': { type: 'directory', children: {} }
                }
            }
        };
    }

    // Initialize package system
    initializePackages() {
        return {
            installed: ['python', 'git', 'curl', 'wget', 'nano'],
            available: ['nodejs', 'php', 'ruby', 'golang', 'rust', 'java', 'gcc', 'make', 'vim', 'htop']
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Terminal input
        const terminalInput = document.getElementById('terminal-input');
        terminalInput.addEventListener('keydown', (e) => this.handleTerminalInput(e));

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Terminal controls
        document.getElementById('clearTerminal').addEventListener('click', () => this.clearTerminal());
        document.getElementById('newSession').addEventListener('click', () => this.createNewSession());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('font-size').addEventListener('input', (e) => this.updateFontSize(e.target.value));
        document.getElementById('theme-select').addEventListener('change', (e) => this.setTheme(e.target.value));

        // Package search
        document.getElementById('package-search').addEventListener('input', (e) => this.searchPackages(e.target.value));
    }

    // Setup navigation
    setupNavigation() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        // Show terminal section by default
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById('terminal').classList.add('active');
    }

    // Handle navigation clicks
    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');

        // Show target section
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
    }

    // Setup terminal
    setupTerminal() {
        this.focusTerminalInput();
    }

    // Create new session
    createSession(sessionId) {
        this.sessions.set(sessionId, {
            id: sessionId,
            directory: '/home/user',
            history: [],
            output: []
        });
        this.currentSession = sessionId;
    }

    // Create new session tab
    createNewSession() {
        const newSessionId = Math.max(...this.sessions.keys()) + 1;
        this.createSession(newSessionId);
        
        // Add new tab
        const tabsContainer = document.querySelector('.terminal-tabs');
        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.setAttribute('data-session', newSessionId);
        newTab.innerHTML = `
            <span>Session ${newSessionId}</span>
            <button class="tab-close">×</button>
        `;
        
        // Remove active from other tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        newTab.classList.add('active');
        
        tabsContainer.appendChild(newTab);
        
        // Add event listeners
        newTab.addEventListener('click', () => this.switchSession(newSessionId));
        newTab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeSession(newSessionId);
        });

        this.clearTerminal();
        this.focusTerminalInput();
    }

    // Switch between sessions
    switchSession(sessionId) {
        this.currentSession = sessionId;
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-session="${sessionId}"]`).classList.add('active');
        
        // Load session output
        this.loadSessionOutput(sessionId);
        this.focusTerminalInput();
    }

    // Close session
    closeSession(sessionId) {
        if (this.sessions.size <= 1) return; // Keep at least one session
        
        this.sessions.delete(sessionId);
        document.querySelector(`[data-session="${sessionId}"]`).remove();
        
        // Switch to first available session
        const firstSessionId = this.sessions.keys().next().value;
        this.switchSession(firstSessionId);
    }

    // Load session output
    loadSessionOutput(sessionId) {
        const session = this.sessions.get(sessionId);
        const output = document.getElementById('terminal-output');
        
        // Clear current output
        output.innerHTML = '';
        
        // Add welcome message
        this.addWelcomeMessage();
        
        // Add session history
        session.output.forEach(item => {
            output.appendChild(item.cloneNode(true));
        });
        
        this.scrollToBottom();
    }

    // Handle terminal input
    handleTerminalInput(e) {
        const input = e.target;
        
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                this.executeCommand(command);
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
            }
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.handleTabCompletion(input);
        }
    }

    // Execute command
    executeCommand(command) {
        const session = this.sessions.get(this.currentSession);
        const output = document.getElementById('terminal-output');
        
        // Add command to output
        const commandElement = document.createElement('div');
        commandElement.className = 'command-line';
        commandElement.innerHTML = `<span class="prompt">$ </span><span>${this.escapeHtml(command)}</span>`;
        output.appendChild(commandElement);
        
        // Parse and execute command
        const result = this.parseCommand(command);
        
        // Add result to output
        if (result) {
            const resultElement = document.createElement('div');
            resultElement.className = `command-output ${result.type || ''}`;
            resultElement.innerHTML = result.output;
            output.appendChild(resultElement);
            
            // Save to session
            session.output.push(commandElement.cloneNode(true));
            session.output.push(resultElement.cloneNode(true));
        }
        
        this.scrollToBottom();
    }

    // Parse and execute command
    parseCommand(command) {
        const parts = command.trim().split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);
        
        switch (cmd) {
            case 'help':
                return this.cmdHelp();
            case 'clear':
                this.clearTerminal();
                return null;
            case 'ls':
                return this.cmdLs(args);
            case 'cd':
                return this.cmdCd(args);
            case 'pwd':
                return this.cmdPwd();
            case 'cat':
                return this.cmdCat(args);
            case 'mkdir':
                return this.cmdMkdir(args);
            case 'touch':
                return this.cmdTouch(args);
            case 'rm':
                return this.cmdRm(args);
            case 'echo':
                return this.cmdEcho(args);
            case 'date':
                return this.cmdDate();
            case 'whoami':
                return this.cmdWhoami();
            case 'uname':
                return this.cmdUname(args);
            case 'pkg':
                return this.cmdPkg(args);
            case 'apt':
                return this.cmdApt(args);
            default:
                return {
                    output: `Command not found: ${this.escapeHtml(cmd)}. Type 'help' for available commands.`,
                    type: 'error-output'
                };
        }
    }

    // Command implementations
    cmdHelp() {
        return {
            output: `
Available commands:
<br><br>
<strong>File System:</strong>
<br>ls [path]          - List directory contents
<br>cd [path]          - Change directory
<br>pwd               - Print working directory
<br>cat [file]        - Display file contents
<br>mkdir [dir]       - Create directory
<br>touch [file]      - Create empty file
<br>rm [file/dir]     - Remove file or directory
<br><br>
<strong>System:</strong>
<br>echo [text]       - Display text
<br>date              - Show current date and time
<br>whoami            - Show current user
<br>uname [-a]        - Show system information
<br>clear             - Clear terminal
<br><br>
<strong>Package Management:</strong>
<br>pkg install [package]  - Install package
<br>pkg list               - List installed packages
<br>pkg search [query]     - Search packages
<br>apt update             - Update package lists
<br><br>
<strong>Navigation:</strong>
<br>Use Tab for auto-completion
<br>Use ↑/↓ arrows for command history
            `,
            type: 'success-output'
        };
    }

    cmdLs(args) {
        const path = args[0] || this.currentDirectory;
        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(resolvedPath);
        
        if (!node) {
            return { output: `ls: cannot access '${this.escapeHtml(path)}': No such file or directory`, type: 'error-output' };
        }
        
        if (node.type !== 'directory') {
            return { output: this.escapeHtml(path), type: '' };
        }
        
        const items = Object.keys(node.children).sort();
        if (items.length === 0) {
            return { output: '', type: '' };
        }
        
        const output = items.map(item => {
            const child = node.children[item];
            const prefix = child.type === 'directory' ? '<span style="color: #58a6ff;">📁 ' : 
                          child.type === 'executable' ? '<span style="color: #238636;">⚡ ' : '📄 ';
            return `${prefix}${this.escapeHtml(item)}</span>`;
        }).join('<br>');
        
        return { output, type: '' };
    }

    cmdCd(args) {
        const path = args[0] || '/home/user';
        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(resolvedPath);
        
        if (!node) {
            return { output: `cd: no such file or directory: ${this.escapeHtml(path)}`, type: 'error-output' };
        }
        
        if (node.type !== 'directory') {
            return { output: `cd: not a directory: ${this.escapeHtml(path)}`, type: 'error-output' };
        }
        
        this.currentDirectory = resolvedPath;
        const session = this.sessions.get(this.currentSession);
        session.directory = resolvedPath;
        
        return null;
    }

    cmdPwd() {
        return { output: this.currentDirectory, type: '' };
    }

    cmdCat(args) {
        if (args.length === 0) {
            return { output: 'cat: missing file operand', type: 'error-output' };
        }
        
        const path = args[0];
        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(resolvedPath);
        
        if (!node) {
            return { output: `cat: ${this.escapeHtml(path)}: No such file or directory`, type: 'error-output' };
        }
        
        if (node.type !== 'file') {
            return { output: `cat: ${this.escapeHtml(path)}: Is a directory`, type: 'error-output' };
        }
        
        return { output: this.escapeHtml(node.content || ''), type: '' };
    }

    cmdMkdir(args) {
        if (args.length === 0) {
            return { output: 'mkdir: missing operand', type: 'error-output' };
        }
        
        const path = args[0];
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const dirname = this.getBasename(resolvedPath);
        
        const parentNode = this.getNode(parentPath);
        if (!parentNode || parentNode.type !== 'directory') {
            return { output: `mkdir: cannot create directory '${this.escapeHtml(path)}': No such file or directory`, type: 'error-output' };
        }
        
        if (parentNode.children[dirname]) {
            return { output: `mkdir: cannot create directory '${this.escapeHtml(path)}': File exists`, type: 'error-output' };
        }
        
        parentNode.children[dirname] = { type: 'directory', children: {} };
        return { output: '', type: 'success-output' };
    }

    cmdTouch(args) {
        if (args.length === 0) {
            return { output: 'touch: missing file operand', type: 'error-output' };
        }
        
        const path = args[0];
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const filename = this.getBasename(resolvedPath);
        
        const parentNode = this.getNode(parentPath);
        if (!parentNode || parentNode.type !== 'directory') {
            return { output: `touch: cannot touch '${this.escapeHtml(path)}': No such file or directory`, type: 'error-output' };
        }
        
        if (!parentNode.children[filename]) {
            parentNode.children[filename] = { type: 'file', content: '' };
        }
        
        return { output: '', type: 'success-output' };
    }

    cmdRm(args) {
        if (args.length === 0) {
            return { output: 'rm: missing operand', type: 'error-output' };
        }
        
        const path = args[0];
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const filename = this.getBasename(resolvedPath);
        
        const parentNode = this.getNode(parentPath);
        if (!parentNode || !parentNode.children[filename]) {
            return { output: `rm: cannot remove '${this.escapeHtml(path)}': No such file or directory`, type: 'error-output' };
        }
        
        delete parentNode.children[filename];
        return { output: '', type: 'success-output' };
    }

    cmdEcho(args) {
        return { output: this.escapeHtml(args.join(' ')), type: '' };
    }

    cmdDate() {
        return { output: new Date().toString(), type: '' };
    }

    cmdWhoami() {
        return { output: 'user', type: '' };
    }

    cmdUname(args) {
        if (args.includes('-a')) {
            return { output: 'Termux Web 1.0.0 (Browser) JavaScript Engine', type: '' };
        }
        return { output: 'Termux Web', type: '' };
    }

    cmdPkg(args) {
        if (args.length === 0) {
            return { output: 'Usage: pkg [install|list|search] [package]', type: 'error-output' };
        }
        
        const action = args[0];
        const packageName = args[1];
        
        switch (action) {
            case 'install':
                if (!packageName) {
                    return { output: 'pkg install: missing package name', type: 'error-output' };
                }
                if (this.packages.installed.includes(packageName)) {
                    return { output: `Package ${packageName} is already installed`, type: 'error-output' };
                }
                if (!this.packages.available.includes(packageName)) {
                    return { output: `Package ${packageName} not found`, type: 'error-output' };
                }
                
                this.packages.installed.push(packageName);
                this.packages.available = this.packages.available.filter(p => p !== packageName);
                return { output: `Successfully installed ${packageName}`, type: 'success-output' };
                
            case 'list':
                return { output: 'Installed packages:<br>' + this.packages.installed.join('<br>'), type: '' };
                
            case 'search':
                if (!packageName) {
                    return { output: 'Available packages:<br>' + this.packages.available.join('<br>'), type: '' };
                }
                const matches = this.packages.available.filter(p => p.includes(packageName));
                return { output: matches.length ? matches.join('<br>') : 'No packages found', type: '' };
                
            default:
                return { output: `pkg: unknown action '${action}'`, type: 'error-output' };
        }
    }

    cmdApt(args) {
        if (args.length === 0) {
            return { output: 'Usage: apt [update|upgrade|install] [package]', type: 'error-output' };
        }
        
        const action = args[0];
        
        switch (action) {
            case 'update':
                return { output: 'Reading package lists... Done<br>Package lists updated successfully', type: 'success-output' };
            case 'upgrade':
                return { output: 'Reading package lists... Done<br>All packages are up to date', type: 'success-output' };
            case 'install':
                return this.cmdPkg(['install', ...args.slice(1)]);
            default:
                return { output: `apt: unknown action '${action}'`, type: 'error-output' };
        }
    }

    // File system utilities
    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        
        const parts = this.currentDirectory.split('/').filter(p => p);
        const pathParts = path.split('/').filter(p => p);
        
        for (const part of pathParts) {
            if (part === '..') {
                parts.pop();
            } else if (part !== '.') {
                parts.push(part);
            }
        }
        
        return '/' + parts.join('/');
    }

    getNode(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        
        return current;
    }

    getParentPath(path) {
        const parts = path.split('/');
        parts.pop();
        return parts.join('/') || '/';
    }

    getBasename(path) {
        const parts = path.split('/');
        return parts[parts.length - 1];
    }

    // Tab completion
    handleTabCompletion(input) {
        const value = input.value;
        const parts = value.split(' ');
        const lastPart = parts[parts.length - 1];
        
        if (parts.length === 1) {
            // Command completion
            const commands = ['help', 'clear', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'echo', 'date', 'whoami', 'uname', 'pkg', 'apt'];
            const matches = commands.filter(cmd => cmd.startsWith(lastPart));
            
            if (matches.length === 1) {
                input.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                this.showCompletions(matches);
            }
        } else {
            // File/directory completion
            const path = lastPart || '.';
            const dir = path.includes('/') ? this.getParentPath(this.resolvePath(path)) : this.currentDirectory;
            const prefix = path.includes('/') ? this.getBasename(path) : path;
            
            const node = this.getNode(dir);
            if (node && node.type === 'directory') {
                const matches = Object.keys(node.children).filter(name => name.startsWith(prefix));
                
                if (matches.length === 1) {
                    const newPath = dir === '/' ? '/' + matches[0] : dir + '/' + matches[0];
                    const relativePath = this.getRelativePath(newPath);
                    parts[parts.length - 1] = relativePath;
                    input.value = parts.join(' ') + (node.children[matches[0]].type === 'directory' ? '/' : ' ');
                } else if (matches.length > 1) {
                    this.showCompletions(matches);
                }
            }
        }
    }

    getRelativePath(absolutePath) {
        if (absolutePath.startsWith(this.currentDirectory + '/')) {
            return absolutePath.substring(this.currentDirectory.length + 1);
        }
        return absolutePath;
    }

    showCompletions(matches) {
        const output = document.getElementById('terminal-output');
        const completionElement = document.createElement('div');
        completionElement.className = 'command-output';
        completionElement.innerHTML = matches.join('&nbsp;&nbsp;&nbsp;&nbsp;');
        output.appendChild(completionElement);
        this.scrollToBottom();
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addWelcomeMessage() {
        const output = document.getElementById('terminal-output');
        output.innerHTML = `
            <div class="welcome-message">
                <div class="ascii-art">
                    <pre>
████████╗███████╗██████╗ ███╗   ███╗██╗   ██╗██╗  ██╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║   ██║╚██╗██╔╝
   ██║   █████╗  ██████╔╝██╔████╔██║██║   ██║ ╚███╔╝ 
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║ ██╔██╗ 
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝██╔╝ ██╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝
                    </pre>
                </div>
                <p>Welcome to Termux Web Terminal</p>
                <p>Type 'help' to see available commands</p>
                <div class="prompt-line">
                    <span class="prompt">$ </span>
                </div>
            </div>
        `;
    }

    clearTerminal() {
        this.addWelcomeMessage();
        const session = this.sessions.get(this.currentSession);
        session.output = [];
    }

    scrollToBottom() {
        const output = document.getElementById('terminal-output');
        output.scrollTop = output.scrollHeight;
    }

    focusTerminalInput() {
        document.getElementById('terminal-input').focus();
    }

    // Theme management
    setupTheme() {
        const savedTheme = localStorage.getItem('termux-web-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('termux-web-theme', theme);
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = theme;
        }
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Settings
    updateFontSize(size) {
        document.documentElement.style.setProperty('--terminal-font-size', size + 'px');
        document.getElementById('font-size-value').textContent = size + 'px';
        localStorage.setItem('termux-web-font-size', size);
    }

    // Package search
    searchPackages(query) {
        const packageCards = document.querySelectorAll('.package-card');
        packageCards.forEach(card => {
            const packageName = card.querySelector('h3').textContent.toLowerCase();
            const packageDesc = card.querySelector('p').textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (packageName.includes(searchTerm) || packageDesc.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.termuxWeb = new TermuxWeb();
});

// Handle window focus to keep terminal input focused
window.addEventListener('focus', () => {
    if (window.termuxWeb) {
        window.termuxWeb.focusTerminalInput();
    }
});

// Handle clicks on terminal area to focus input
document.addEventListener('click', (e) => {
    if (e.target.closest('.terminal-body')) {
        if (window.termuxWeb) {
            window.termuxWeb.focusTerminalInput();
        }
    }
});

