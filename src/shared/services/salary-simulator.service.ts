import type { SalarySetting } from '@/shared/interfaces';

export const salarySimulatorService = {
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(value);
    },

    toNumber(value: string): number {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    },

    formatDateBR(value: string): string {
        if (value === '9999-12-31') return 'Vigente';
        return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
    },

    getErrorMessage(error: unknown): string {
        if (typeof error === 'object' && error && 'message' in error) {
            const message = (error as { message?: string }).message;
            if (message) return message;
        }
        return 'Nao foi possivel salvar a configuracao.';
    },

    buildSettingKey(setting: Pick<SalarySetting, 'date_start' | 'date_end'>): string {
        return `${setting.date_start}|${setting.date_end}`;
    }
};
