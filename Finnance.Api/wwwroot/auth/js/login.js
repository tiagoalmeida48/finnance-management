(() => {
    const CONSTANTS = {
        MFA_CODE_LENGTH: 6,
        REDIRECT_DELAY: 100,
        DEFAULT_RETURN_URL: '/swagger'
    };

    const elements = {
        form: document.getElementById('login-form'),
        errBox: document.getElementById('error'),
        successBox: document.getElementById('success'),
        userInput: document.getElementById('user'),
        passwordInput: document.getElementById('password'),
        platformButtons: document.querySelectorAll('.auth-platform-btn'),
        mfaModal: document.getElementById('mfa-modal'),
        mfaForm: document.getElementById('mfa-form'),
        mfaCodeInput: document.getElementById('mfa-code'),
        mfaBtn: document.getElementById('btnMfa'),
        mfaError: document.getElementById('mfa-error')
    };

    const state = {
        tempMfaToken: null,
        targetPlatform: null
    };

    const utils = {
        getReturnUrl() {
            if (state.targetPlatform) {
                return `/${state.targetPlatform}`;
            }
            const params = new URLSearchParams(location.search);
            return params.get('returnUrl') || CONSTANTS.DEFAULT_RETURN_URL;
        },

        validateCredentials(username, password) {
            return username?.trim() && password?.trim();
        },

        validateMfaCode(code) {
            return code?.trim().length === CONSTANTS.MFA_CODE_LENGTH;
        },

        sanitizeMfaInput(value) {
            return value.replace(/[^0-9]/g, '');
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

        setPlatformButtonLoading(button, loading) {
            if (!button) return;

            button.disabled = loading;
            button.classList.toggle('loading', loading);

            elements.platformButtons.forEach(btn => {
                if (btn !== button) {
                    btn.disabled = loading;
                }
            });
        }
    };

    const mfa = {
        show() {
            if (elements.mfaModal) {
                elements.mfaModal.style.display = 'flex';
                elements.mfaCodeInput?.focus();
            }
        },

        hide() {
            if (elements.mfaModal) {
                elements.mfaModal.style.display = 'none';
                elements.mfaCodeInput.value = '';
                state.tempMfaToken = null;
            }
        },

        showError(message) {
            if (elements.mfaError) {
                elements.mfaError.textContent = message;
                elements.mfaError.classList.add('show');
            }
        },

        hideError() {
            elements.mfaError?.classList.remove('show');
        },

        setLoading(loading) {
            if (elements.mfaBtn) {
                elements.mfaBtn.disabled = loading;
                elements.mfaBtn.classList.toggle('loading', loading);
            }
        },

        clearInput() {
            if (elements.mfaCodeInput) {
                elements.mfaCodeInput.value = '';
                elements.mfaCodeInput.focus();
            }
        }
    };

    const handlers = {
        async handlePlatformLogin(platform, button) {
            state.targetPlatform = platform;

            const username = elements.userInput?.value.trim() || '';
            const password = elements.passwordInput?.value.trim() || '';

            if (!utils.validateCredentials(username, password)) {
                ui.showMessage('Preencha usuário e senha', 'error');
                return;
            }

            ui.hideMessages();
            ui.setPlatformButtonLoading(button, true);

            try {
                const result = await AuthManager.login(username, password);

                if (result.success) {
                    const data = result.result;

                    if (data?.requireMfa) {
                        state.tempMfaToken = data.token;
                        mfa.show();
                        ui.setPlatformButtonLoading(button, false);
                    } else {
                        window.location.href = utils.getReturnUrl();
                    }
                }
            } catch (error) {
                ui.showMessage(error.message || 'Erro ao fazer login', 'error');
                ui.setPlatformButtonLoading(button, false);
                state.targetPlatform = null;
            }
        },

        async handleMfaValidation(e) {
            e.preventDefault();

            const mfaCode = elements.mfaCodeInput?.value.trim() || '';

            if (!utils.validateMfaCode(mfaCode)) {
                mfa.showError('Digite um código de 6 dígitos');
                return;
            }

            mfa.hideError();
            mfa.setLoading(true);

            try {
                const result = await AuthManager.validateMfa(state.tempMfaToken, mfaCode);

                if (result.success) {
                    setTimeout(() => {
                        window.location.href = utils.getReturnUrl();
                    }, CONSTANTS.REDIRECT_DELAY);
                }
            } catch (error) {
                mfa.showError(error.message || 'Código MFA inválido');
                mfa.clearInput();
            } finally {
                mfa.setLoading(false);
            }
        }
    };

    const initializeEvents = () => {
        elements.platformButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.getAttribute('data-platform');
                handlers.handlePlatformLogin(platform, button);
            });
        });

        elements.mfaForm?.addEventListener('submit', handlers.handleMfaValidation);
        elements.mfaCodeInput?.addEventListener('input', (e) => {
            e.target.value = utils.sanitizeMfaInput(e.target.value);
        });

        const triggerFirstPlatform = (e) => {
            if (e.key === 'Enter' && elements.platformButtons.length > 0) {
                e.preventDefault();
                elements.platformButtons[0].click();
            }
        };

        elements.userInput?.addEventListener('keypress', triggerFirstPlatform);
        elements.passwordInput?.addEventListener('keypress', triggerFirstPlatform);
    };

    initializeEvents();
})();