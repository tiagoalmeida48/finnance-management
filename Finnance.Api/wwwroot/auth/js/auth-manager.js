window.AuthManager = (() => {
    const CONFIG = {
        MAX_ATTEMPTS: 30,
        RETRY_DELAY: 1000
    };

    const ENDPOINTS = {
        GET_TOKEN: '/api/auth/get-token',
        LOGIN: '/api/auth/login',
        VALIDATE_MFA: '/api/authentication/validate-code-mfa',
        LOGOUT: '/api/auth/logout'
    };

    const PLATFORMS = [
        { name: 'Swagger', path: '/swagger' },
        { name: 'Scalar', path: '/scalar' },
        { name: 'GraphQL', path: '/graphql' },
        { name: 'Scheduler', path: '/scheduler' }
    ];

    const MENU_ACTIONS = [
        { name: 'Obter token', action: 'copy-token' }
    ];

    const STYLES = {
        CONTAINER: `
            position: fixed !important;
            top: 5px !important;
            right: 20px !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        `,
        PLATFORM_BUTTON: `
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 28px !important;
            height: 28px !important;
            padding: 0 8px !important;
            border-radius: 6px !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            background: rgba(59, 130, 246, 0.9) !important;
            color: white !important;
            cursor: pointer !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            font-size: 12px !important;
            font-weight: 500 !important;
        `,
        LOGOUT_BUTTON: `
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 28px !important;
            border-radius: 8px !important;
            border: 1px solid rgba(220, 38, 38, 0.3) !important;
            background: #dc2626 !important;
            color: white !important;
            padding: 0 10px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            white-space: nowrap !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        `,
        PLATFORM_DROPDOWN_MENU: `
            position: fixed !important; 
            min-width: 140px !important; 
            background: rgba(16, 41, 79, 0.98) !important; 
            backdrop-filter: blur(10px) !important; 
            border-radius: 8px !important; 
            border: 1px solid rgba(255, 255, 255, 0.15) !important; 
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5) !important; 
            overflow: hidden !important; 
            z-index: 999999 !important; 
            opacity: 0; 
            visibility: hidden; 
            transform: translateY(-10px); 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            pointer-events: auto !important;
        `,
        PLATFORM_DROPDOWN: `
            position: relative !important;
            display: inline-block !important;
            z-index: 999999 !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        `,
        MENU_SEPARATOR: `
            height: 1px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            margin: 4px 0 !important;
        `,
        NOTIFICATION: `
            position: fixed !important;
            top: 70px !important;
            right: 20px !important;
            background: rgba(34, 197, 94, 0.95) !important;
            color: white !important;
            padding: 12px 20px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            z-index: 999999 !important;
            opacity: 0 !important;
            transform: translateY(-10px) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        `
    };

    let token = null;

    async function getToken() {
        const response = await fetch(ENDPOINTS.GET_TOKEN, { credentials: 'include' });
        token = await response.text();
    }

    async function login(username, password) {
        try {
            const response = await fetch(ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ User: username, Password: password })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Erro no servidor: resposta inválida');
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                throw new Error('Erro no servidor: resposta vazia');
            }

            const data = JSON.parse(text);

            if (!response.ok || data == null || !(data.Success || data.success)) {
                throw new Error(data?.Message || data?.message || 'Credenciais inválidas');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async function validateMfa(tokenMfa, codeMfa) {
        try {
            const response = await fetch(ENDPOINTS.VALIDATE_MFA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ Token: tokenMfa, CodeMfa: codeMfa })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Erro no servidor: resposta inválida');
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                throw new Error('Erro no servidor: resposta vazia');
            }

            const data = JSON.parse(text);

            if (!response.ok || data == null || !(data.Success || data.success)) {
                throw new Error(data?.Message || data?.message || 'Código MFA inválido');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async function logout() {
        await fetch(ENDPOINTS.LOGOUT, { method: 'GET', credentials: 'include' });
        window.location.reload();
    }

    async function copyTokenToClipboard() {
        if (!token) {
            await getToken();
        }

        await navigator.clipboard.writeText(token);
        showNotification('Token copiado com sucesso!', 'success');
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        notification.textContent = message;
        
        notification.setAttribute('style', STYLES.NOTIFICATION);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async function tryInjectToken() {
        if (!token) return false;

        if (location.pathname.startsWith('/swagger')) {
            if (typeof window.ui?.preauthorizeApiKey === 'function') {
                window.ui.preauthorizeApiKey('Bearer', token);
                return !!window?.ui?.authSelectors?.authorized?.()?.get?.('Bearer');
            }

            const tokenInput = document.querySelector('#auth-bearer-value');
            if (tokenInput != null) {
                tokenInput.value = token;
                tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            }
        }

        if (location.pathname.startsWith('/scalar')) {
            const input = document.querySelector('.scalar-password-input');
            if (input != null) {
                input.value = token;

                const events = ['input', 'change', 'keyup', 'blur'];
                events.forEach(eventType => {
                    input.dispatchEvent(new Event(eventType, { bubbles: true }));
                });

                return true;
            }
        }

        if (location.pathname.startsWith('/graphql')) {
            return await configureGraphQLToken();
        }

        return false;
    }

    async function injectToken() {
        await getToken();
        if (!token) return;

        let attempts = 0;
        let success = false;

        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));

        do {
            success = await tryInjectToken();
            if (!success) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            }
        } while (!success && attempts < CONFIG.MAX_ATTEMPTS);
    }

    async function ensureDocumentTabOpen() {
        const queryEditor = document.querySelector('.monaco-editor');

        if (queryEditor && queryEditor.offsetParent !== null) {
            return true;
        }

        const button = document.querySelector('button.MuiButton-contained.create');
        if (button && button.offsetParent !== null) {
            button.click();
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return true;
        }

        return false;
    }

    async function configureGraphQLToken() {
        if (!token) return false;

        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        await ensureDocumentTabOpen();

        const configButton = document.querySelector('button[aria-label="Connection Settings"]');
        if (configButton) {
            configButton.click();
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        }
        
        const authButton = document.querySelector('button[data-key="1"]');
        if (authButton) {
            authButton.click();
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        }
        
        const tokenSelect = document.querySelector('select#auth-flow');
        if (tokenSelect && tokenSelect.value !== 'bearer') {
            tokenSelect.value = 'bearer';

            tokenSelect.dispatchEvent(new Event('change', { bubbles: true }));
            tokenSelect.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const tokenInput = document.querySelector('input#token');
        if (tokenInput) {
            tokenInput.value = '';
            tokenInput.value = token;
            tokenInput.dispatchEvent(new Event('change', { bubbles: true }));
            tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        document.querySelector('footer.sc-dUiqtx.bRITYL button.MuiButton-containedPrimary').click();
        return true;
    }

    function createLogoutButton() {
        const oldContainer = document.querySelector('.auth-top-bar');
        if (oldContainer) {
            oldContainer.remove();
        }

        const container = document.createElement('div');
        container.className = 'auth-top-bar';
        container.setAttribute('style', STYLES.CONTAINER);

        if (location.pathname.startsWith('/scalar')) {
            const header = document.querySelector('header');
            if (header) header.style.paddingRight = '150px';
        }

        const platformDropdown = createPlatformDropdown();
        container.appendChild(platformDropdown);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.setAttribute('style', STYLES.LOGOUT_BUTTON);
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = async () => await logout();

        container.appendChild(logoutBtn);
        document.body.appendChild(container);
    }

    function createPlatformDropdown() {
        const platformDropdown = document.createElement('div');
        platformDropdown.className = 'platform-dropdown';
        platformDropdown.setAttribute('style', STYLES.PLATFORM_DROPDOWN);

        const platformBtn = document.createElement('button');
        platformBtn.className = 'platform-dropdown-btn';
        platformBtn.setAttribute('style', STYLES.PLATFORM_BUTTON);
        platformBtn.textContent = '☰';

        const platformMenu = document.createElement('div');
        platformMenu.className = 'platform-dropdown-menu';
        platformMenu.setAttribute('style', STYLES.PLATFORM_DROPDOWN_MENU);

        MENU_ACTIONS.forEach(menuAction => {
            const item = document.createElement('a');
            item.className = 'platform-dropdown-item menu-action';
            item.href = '#';
            item.textContent = menuAction.name;

            item.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (menuAction.action === 'copy-token') {
                    await copyTokenToClipboard();
                }

                platformMenu.style.opacity = '0';
                platformMenu.style.visibility = 'hidden';
                platformMenu.style.transform = 'translateY(-10px)';
                platformDropdown.classList.remove('open');
            };

            platformMenu.appendChild(item);
        });

        PLATFORMS.forEach(platform => {
            const item = document.createElement('a');
            item.className = 'platform-dropdown-item';
            item.href = platform.path;
            item.textContent = platform.name;

            if (location.pathname.startsWith(platform.path)) {
                item.classList.add('active');
            }

            platformMenu.appendChild(item);
        });
        
        platformBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = platformDropdown.classList.contains('open');

            if (!isOpen) {
                const rect = platformBtn.getBoundingClientRect();
                platformMenu.style.position = 'fixed';
                platformMenu.style.top = `${rect.bottom + 4}px`;
                platformMenu.style.right = `${window.innerWidth - rect.right}px`;
                platformMenu.style.left = 'auto';
                platformMenu.style.opacity = '1';
                platformMenu.style.visibility = 'visible';
                platformMenu.style.transform = 'translateY(0)';
                platformDropdown.classList.add('open');
            } else {
                platformMenu.style.opacity = '0';
                platformMenu.style.visibility = 'hidden';
                platformMenu.style.transform = 'translateY(-10px)';
                platformDropdown.classList.remove('open');
            }
        };

        platformMenu.onclick = (e) => e.stopPropagation();

        document.addEventListener('click', () => {
            if (platformDropdown.classList.contains('open')) {
                platformMenu.style.opacity = '0';
                platformMenu.style.visibility = 'hidden';
                platformMenu.style.transform = 'translateY(-10px)';
                platformDropdown.classList.remove('open');
            }
        });

        const updateMenuPosition = () => {
            if (platformDropdown.classList.contains('open')) {
                const rect = platformBtn.getBoundingClientRect();
                platformMenu.style.top = `${rect.bottom + 4}px`;
                platformMenu.style.right = `${window.innerWidth - rect.right}px`;
            }
        };

        window.addEventListener('scroll', updateMenuPosition, true);
        window.addEventListener('resize', updateMenuPosition);

        platformDropdown.appendChild(platformBtn);
        document.body.appendChild(platformMenu);

        return platformDropdown;
    }

    async function init() {
        const isSupportedPlatform = PLATFORMS.some(p => location.pathname.startsWith(p.path));
        if (!isSupportedPlatform) return;

        await injectToken();

        if (location.pathname.startsWith('/graphql')) {
            setTimeout(() => {
                createLogoutButton();
                setInterval(() => {
                    if (!document.querySelector('.auth-top-bar')) {
                        createLogoutButton();
                    }
                }, CONFIG.RETRY_DELAY);
            }, CONFIG.RETRY_DELAY);
        } else {
            createLogoutButton();
        }
    }

    return { login, validateMfa, init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthManager.init().catch(console.error));
} else {
    AuthManager.init().catch(console.error);
}