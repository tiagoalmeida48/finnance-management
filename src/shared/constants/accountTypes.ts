import type { AccountType } from '@/shared/interfaces/account.interface';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, Landmark, Wallet } from 'lucide-react';

export const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = [
    { value: 'checking', label: 'Conta Corrente' },
    { value: 'savings', label: 'Poupança' },
    { value: 'investment', label: 'Investimento' },
    { value: 'wallet', label: 'Dinheiro em Espécie' },
    { value: 'other', label: 'Outro' },
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimento',
    wallet: 'Dinheiro em Espécie',
    other: 'Outro',
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, LucideIcon> = {
    checking: Landmark,
    savings: Wallet,
    investment: CreditCard,
    wallet: CreditCard,
    other: CreditCard,
};

export const getAccountTypeLabel = (type: AccountType) =>
    ACCOUNT_TYPE_LABELS[type] ?? ACCOUNT_TYPE_LABELS.other;

export const getAccountTypeIcon = (type: AccountType) =>
    ACCOUNT_TYPE_ICONS[type] ?? CreditCard;
