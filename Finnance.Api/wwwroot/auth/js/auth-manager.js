window.AuthManager = (() => {
    const CONFIG = {
        MAX_ATTEMPTS: 40,
        RETRY_DELAY: 500
    };

    const ENDPOINTS = {
        GET_TOKEN: '/api/auth/get-token',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    };

    const PAGE_TITLE = 'Finnance · Acesso à API';

    let token = null;
    let keepAuthorizedTimer = null;
    let barWatcherTimer = null;

    async function getToken() {
        try {
            const response = await fetch(ENDPOINTS.GET_TOKEN, { credentials: 'include' });
            const data = await response.json();
            token = data?.result || data?.Result || '';
        } catch {
            token = '';
        }
    }

    async function login(email, password) {
        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ Email: email, Password: password })
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
    }

    function clearClientSession() {
        token = null;

        if (keepAuthorizedTimer) clearInterval(keepAuthorizedTimer);
        if (barWatcherTimer) clearInterval(barWatcherTimer);
        keepAuthorizedTimer = null;
        barWatcherTimer = null;

        try {
            if (typeof window.ui?.authActions?.logout === 'function') {
                window.ui.authActions.logout(['Bearer']);
            }
        } catch {
            /* Swagger UI ainda nao montado */
        }
    }

    async function logout() {
        clearClientSession();

        try {
            await fetch(ENDPOINTS.LOGOUT, { method: 'GET', credentials: 'include', cache: 'no-store' });
        } catch {
            /* ignora falha de rede: o redirect abaixo barra o acesso de qualquer forma */
        } finally {
            window.location.replace('/auth/login.html');
        }
    }

    function isSwaggerAuthorized() {
        try {
            return !!window?.ui?.authSelectors?.authorized?.()?.get?.('Bearer');
        } catch {
            return false;
        }
    }

    function applyPreauthorize() {
        if (typeof window.ui?.preauthorizeApiKey !== 'function') return false;
        window.ui.preauthorizeApiKey('Bearer', token);
        return isSwaggerAuthorized();
    }

    function applyDomFallback() {
        const tokenInput = document.querySelector('#auth-bearer-value, input[aria-label="auth-bearer-value"]');
        if (tokenInput == null) return false;
        tokenInput.value = token;
        tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    async function injectToken() {
        await getToken();
        if (!token) return;

        let attempts = 0;
        let success = false;

        do {
            success = applyPreauthorize() || applyDomFallback();
            if (!success) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            }
        } while (!success && attempts < CONFIG.MAX_ATTEMPTS);

        keepAuthorized();
    }

    function keepAuthorized() {
        keepAuthorizedTimer = setInterval(() => {
            if (token && typeof window.ui?.preauthorizeApiKey === 'function' && !isSwaggerAuthorized()) {
                window.ui.preauthorizeApiKey('Bearer', token);
            }
        }, 2000);
    }

    function createLogoutButton() {
        const topbar = document.querySelector('.swagger-ui .topbar-wrapper');
        const host = topbar || document.body;

        const existing = host.querySelector(':scope > .auth-top-bar');
        if (existing) return;

        document.querySelectorAll('.auth-top-bar').forEach(el => el.remove());

        const container = document.createElement('div');
        container.className = 'auth-top-bar';
        container.classList.toggle('in-topbar', !!topbar);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.type = 'button';
        logoutBtn.innerHTML =
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>' +
            '</svg><span>Sair</span>';
        logoutBtn.onclick = async () => await logout();

        container.appendChild(logoutBtn);
        host.appendChild(container);
    }

    function enforcePageTitle() {
        if (document.title !== PAGE_TITLE) document.title = PAGE_TITLE;
    }

    function enforceFavicon() {
        const expected = '/finnance-icon.svg';
        const current = document.querySelector('link[rel~="icon"]');

        if (current && current.getAttribute('href') === expected) return;

        document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]').forEach(el => el.remove());

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = expected;
        document.head.appendChild(link);
    }

    async function init() {
        if (!location.pathname.startsWith('/swagger')) return;

        enforcePageTitle();
        enforceFavicon();
        await injectToken();
        createLogoutButton();

        barWatcherTimer = setInterval(() => {
            enforcePageTitle();
            enforceFavicon();

            const topbar = document.querySelector('.swagger-ui .topbar-wrapper');
            const bar = document.querySelector('.auth-top-bar');
            const misplaced = topbar && bar && !topbar.contains(bar);

            if (!bar || misplaced) {
                createLogoutButton();
            }
        }, 2000);
    }

    return { login, logout, init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthManager.init().catch(console.error));
} else {
    AuthManager.init().catch(console.error);
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted && location.pathname.startsWith('/swagger')) {
        location.reload();
    }
});
