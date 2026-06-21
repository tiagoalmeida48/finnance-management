(() => {
    const DEFAULT_RETURN_URL = '/swagger';

    const elements = {
        form: document.getElementById('login-form'),
        submitBtn: document.getElementById('btn-login'),
        errBox: document.getElementById('error'),
        successBox: document.getElementById('success'),
        userInput: document.getElementById('user'),
        passwordInput: document.getElementById('password'),
        togglePassword: document.getElementById('toggle-password')
    };

    const utils = {
        getReturnUrl() {
            const params = new URLSearchParams(location.search);
            const returnUrl = params.get('returnUrl');
            if (returnUrl && returnUrl.startsWith('/')) return returnUrl;
            return DEFAULT_RETURN_URL;
        },

        validateCredentials(email, password) {
            return Boolean(email?.trim()) && Boolean(password?.trim());
        }
    };

    const ui = {
        showMessage(message, type) {
            this.hideMessages();
            const box = type === 'error' ? elements.errBox : elements.successBox;
            if (box) {
                box.textContent = message;
                box.classList.add('show');
            }
        },

        hideMessages() {
            elements.errBox?.classList.remove('show');
            elements.successBox?.classList.remove('show');
        },

        setLoading(loading) {
            if (!elements.submitBtn) return;
            elements.submitBtn.disabled = loading;
            elements.submitBtn.classList.toggle('loading', loading);
            elements.userInput.disabled = loading;
            elements.passwordInput.disabled = loading;
        }
    };

    async function handleLogin(event) {
        event.preventDefault();

        const email = elements.userInput?.value.trim() || '';
        const password = elements.passwordInput?.value.trim() || '';

        if (!utils.validateCredentials(email, password)) {
            ui.showMessage('Preencha e-mail e senha', 'error');
            return;
        }

        ui.hideMessages();
        ui.setLoading(true);

        try {
            const result = await AuthManager.login(email, password);

            if (result.success || result.Success) {
                ui.showMessage('Login realizado. Redirecionando...', 'success');
                window.location.href = utils.getReturnUrl();
                return;
            }

            ui.showMessage('Credenciais inválidas', 'error');
            ui.setLoading(false);
        } catch (error) {
            ui.showMessage(error.message || 'Erro ao fazer login', 'error');
            ui.setLoading(false);
        }
    }

    function togglePasswordVisibility() {
        const isHidden = elements.passwordInput.type === 'password';
        elements.passwordInput.type = isHidden ? 'text' : 'password';
        elements.togglePassword.classList.toggle('revealed', isHidden);
        elements.togglePassword.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
        elements.togglePassword.setAttribute('title', isHidden ? 'Ocultar senha' : 'Mostrar senha');
    }

    elements.form?.addEventListener('submit', handleLogin);
    elements.togglePassword?.addEventListener('click', togglePasswordVisibility);
})();
