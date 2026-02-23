import { transactionsCoreService } from './transactions/transactions-core.service';
import { transactionsCreationService } from './transactions/transactions-creation.service';
import { transactionsBatchService } from './transactions/transactions-batch.service';
import { transactionsInstallmentsService } from './transactions/transactions-installments.service';

export const transactionsService = {
    ...transactionsCoreService,
    ...transactionsCreationService,
    ...transactionsBatchService,
    ...transactionsInstallmentsService,
};

export type { Transaction } from '../interfaces';
