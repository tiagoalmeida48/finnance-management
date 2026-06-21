import { apiClient } from '@/config/http';
import type {
  AccountType,
  BankAccount,
  CreateAccountInput,
  UpdateAccountInput,
} from '../types/accounts.types';

export const accountsService = {
  list: (): Promise<BankAccount[]> => apiClient.get<BankAccount[]>('/bank-account/list'),

  get: (bankAccount: number): Promise<BankAccount> =>
    apiClient.get<BankAccount>('/bank-account/get', { bankAccount }),

  create: (input: CreateAccountInput): Promise<number> =>
    apiClient.post<number>('/bank-account/create', input),

  update: (input: UpdateAccountInput): Promise<boolean> =>
    apiClient.put<boolean>('/bank-account/update', input),

  remove: (bankAccount: number): Promise<boolean> =>
    apiClient.delete<boolean>('/bank-account/delete', bankAccount),

  listAccountTypes: (): Promise<AccountType[]> =>
    apiClient.get<AccountType[]>('/account-type/list'),
};
