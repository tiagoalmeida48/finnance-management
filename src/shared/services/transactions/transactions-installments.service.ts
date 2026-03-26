import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../../interfaces';
import { TransactionSchema } from '../../schemas';
import {
  buildInstallmentDescription,
  extractDayFromDateLike,
  filterGroupUpdates,
  replaceDateDayPreservingMonth,
  shiftDateByMonths,
  stripInstallmentSuffix,
  toDateKeyIgnoringTime,
} from '@/shared/utils/transactionsGroup.utils';
import { recalculateInvoicesForTransactions } from '../invoice-reconciliation.service';
import { transactionsCoreService } from './transactions-core.service';
import { transactionsCreationService } from './transactions-creation.service';
import {
  buildSingleTransactionCreatePayload,
  hasChangedValue,
  hasOwn,
} from './transactions-utils.service';

export const transactionsInstallmentsService = {
  async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
    const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';
    const { data: transactionsRaw, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq(column, groupId);

    if (fetchError) throw fetchError;

    const transactions = z.array(TransactionSchema).parse(transactionsRaw ?? []);

    const { error: deleteError } = await supabase.from('transactions').delete().eq(column, groupId);

    if (deleteError) throw deleteError;

    await recalculateInvoicesForTransactions(transactions);
  },

  async insertInstallmentBetween(id: string) {
    const selectedTransaction = await transactionsCoreService.getById(id);
    const installmentGroupId = selectedTransaction.installment_group_id;

    if (!installmentGroupId) {
      throw new Error('A transacao selecionada nao pertence a um grupo de parcelas.');
    }

    const { data: groupTransactionsRaw, error: fetchGroupError } = await supabase
      .from('transactions')
      .select('*')
      .eq('installment_group_id', installmentGroupId);

    if (fetchGroupError) throw fetchGroupError;

    const groupTransactions = z
      .array(TransactionSchema)
      .parse(groupTransactionsRaw ?? [])
      .sort((a, b) => (a.installment_number ?? 0) - (b.installment_number ?? 0));

    if (groupTransactions.length === 0) {
      throw new Error('Nao foi possivel localizar as parcelas do grupo.');
    }

    const selectedInstallmentNumber =
      selectedTransaction.installment_number ??
      groupTransactions.findIndex((transaction) => transaction.id === selectedTransaction.id) + 1;

    if (!selectedInstallmentNumber || selectedInstallmentNumber < 1) {
      throw new Error('Nao foi possivel identificar a parcela selecionada.');
    }

    const currentTotalInstallments = Math.max(
      ...groupTransactions.map(
        (transaction) => transaction.total_installments ?? transaction.installment_number ?? 1,
      ),
      groupTransactions.length,
    );

    const insertionInstallmentNumber = Math.min(
      selectedInstallmentNumber + 1,
      currentTotalInstallments + 1,
    );
    const updatedTotalInstallments = currentTotalInstallments + 1;
    const baseDescription = stripInstallmentSuffix(selectedTransaction.description) || 'Parcela';

    const nextInstallment = groupTransactions.find(
      (transaction) => (transaction.installment_number ?? 0) === insertionInstallmentNumber,
    );

    const insertedPaymentDate = nextInstallment?.payment_date
      ? (toDateKeyIgnoringTime(nextInstallment.payment_date) ?? nextInstallment.payment_date)
      : (shiftDateByMonths(selectedTransaction.payment_date, 1) ??
        toDateKeyIgnoringTime(selectedTransaction.payment_date) ??
        selectedTransaction.payment_date);

    const insertedPurchaseDate = nextInstallment?.purchase_date
      ? (toDateKeyIgnoringTime(nextInstallment.purchase_date) ?? nextInstallment.purchase_date)
      : (shiftDateByMonths(selectedTransaction.purchase_date, 1) ??
        toDateKeyIgnoringTime(selectedTransaction.purchase_date ?? undefined) ??
        selectedTransaction.purchase_date ??
        null);

    const descendingInstallments = [...groupTransactions].sort(
      (a, b) => (b.installment_number ?? 0) - (a.installment_number ?? 0),
    );

    for (const transaction of descendingInstallments) {
      const currentInstallmentNumber = transaction.installment_number ?? 1;

      if (currentInstallmentNumber >= insertionInstallmentNumber) {
        const shiftedPaymentDate =
          shiftDateByMonths(transaction.payment_date, 1) ??
          toDateKeyIgnoringTime(transaction.payment_date) ??
          transaction.payment_date;

        const shiftedPurchaseDate = transaction.purchase_date
          ? (shiftDateByMonths(transaction.purchase_date, 1) ??
            toDateKeyIgnoringTime(transaction.purchase_date) ??
            transaction.purchase_date)
          : null;

        await transactionsCoreService.update(transaction.id, {
          installment_number: currentInstallmentNumber + 1,
          total_installments: updatedTotalInstallments,
          description: buildInstallmentDescription(
            baseDescription,
            currentInstallmentNumber + 1,
            updatedTotalInstallments,
          ),
          payment_date: shiftedPaymentDate,
          purchase_date: shiftedPurchaseDate,
        });

        continue;
      }

      await transactionsCoreService.update(transaction.id, {
        total_installments: updatedTotalInstallments,
        description: buildInstallmentDescription(
          baseDescription,
          currentInstallmentNumber,
          updatedTotalInstallments,
        ),
      });
    }

    const insertedInstallmentDraft = await transactionsCreationService.create(
      buildSingleTransactionCreatePayload(selectedTransaction, {
        description: buildInstallmentDescription(
          baseDescription,
          insertionInstallmentNumber,
          updatedTotalInstallments,
        ),
        payment_date: insertedPaymentDate,
        purchase_date: insertedPurchaseDate ?? undefined,
        is_paid: false,
      }),
    );

    return await transactionsCoreService.update(insertedInstallmentDraft.id, {
      installment_group_id: installmentGroupId,
      installment_number: insertionInstallmentNumber,
      total_installments: updatedTotalInstallments,
      description: buildInstallmentDescription(
        baseDescription,
        insertionInstallmentNumber,
        updatedTotalInstallments,
      ),
      payment_date: insertedPaymentDate,
      purchase_date: insertedPurchaseDate ?? undefined,
      recurring_group_id: null,
      is_fixed: false,
      is_paid: false,
    });
  },

  async updateGroup(
    groupId: string,
    type: 'installment' | 'recurring',
    updates: Partial<Transaction>,
  ) {
    const groupUpdates = filterGroupUpdates(updates);
    if (Object.keys(groupUpdates).length === 0) return [];

    const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';
    const { data: transactionsRaw, error: fetchGroupError } = await supabase
      .from('transactions')
      .select('*')
      .eq(column, groupId);

    if (fetchGroupError) throw fetchGroupError;

    const transactions = z.array(TransactionSchema).parse(transactionsRaw ?? []);
    if (transactions.length === 0) return [];

    const sortedTransactions = [...transactions].sort((a, b) => {
      if (type === 'installment') {
        return (a.installment_number ?? 0) - (b.installment_number ?? 0);
      }
      return (a.payment_date || '').localeCompare(b.payment_date || '');
    });

    const hasPaymentDate = hasOwn(groupUpdates, 'payment_date');
    const hasPurchaseDate = hasOwn(groupUpdates, 'purchase_date');
    const hasDescription = hasOwn(groupUpdates, 'description');

    const paymentDay = hasPaymentDate
      ? extractDayFromDateLike(groupUpdates.payment_date as string | null | undefined)
      : null;

    const purchaseDay = hasPurchaseDate
      ? extractDayFromDateLike(groupUpdates.purchase_date as string | null | undefined)
      : null;

    const baseDescription =
      hasDescription && typeof groupUpdates.description === 'string'
        ? stripInstallmentSuffix(groupUpdates.description)
        : '';

    const sharedRawUpdates: Partial<Transaction> = { ...groupUpdates };
    delete sharedRawUpdates.payment_date;
    delete sharedRawUpdates.purchase_date;
    delete sharedRawUpdates.description;
    const updatedTransactions: Transaction[] = [];

    for (const transaction of sortedTransactions) {
      const perTransactionUpdates: Partial<Transaction> = {
        ...sharedRawUpdates,
      };

      if (hasPaymentDate) {
        if (paymentDay !== null && transaction.payment_date) {
          const nextPaymentDate = replaceDateDayPreservingMonth(
            transaction.payment_date,
            paymentDay,
          );
          if (nextPaymentDate) perTransactionUpdates.payment_date = nextPaymentDate;
        }
      }

      if (hasPurchaseDate) {
        if (groupUpdates.purchase_date === null) {
          perTransactionUpdates.purchase_date = null;
        } else if (purchaseDay !== null && transaction.purchase_date) {
          const nextPurchaseDate = replaceDateDayPreservingMonth(
            transaction.purchase_date,
            purchaseDay,
          );
          if (nextPurchaseDate) perTransactionUpdates.purchase_date = nextPurchaseDate;
        }
      }

      if (hasDescription) {
        if (type === 'installment') {
          perTransactionUpdates.description = buildInstallmentDescription(
            baseDescription || stripInstallmentSuffix(transaction.description) || 'Parcela',
            transaction.installment_number ?? 1,
            transaction.total_installments ?? sortedTransactions.length,
          );
        } else {
          perTransactionUpdates.description = String(groupUpdates.description ?? '');
        }
      }

      const changedUpdates = Object.fromEntries(
        Object.entries(perTransactionUpdates).filter(([field, value]) =>
          hasChangedValue(
            field as keyof Transaction,
            transaction[field as keyof Transaction],
            value,
          ),
        ),
      ) as Partial<Transaction>;

      if (Object.keys(changedUpdates).length === 0) {
        continue;
      }

      const updatedTransaction = await transactionsCoreService.update(
        transaction.id,
        changedUpdates,
      );
      updatedTransactions.push(updatedTransaction);
    }

    return updatedTransactions;
  },
};
