import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/useToast';

export interface PluggyPreviewRow {
  pluggyId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  paymentDate: string;
  isPaid: boolean;
  isCredit: boolean;
  cardId: string | null;
  accountId: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  installmentGroupId: string | null;
  category: string | null;
  categoryId?: string | null;
}

async function fetchPreview(
  pluggyItemId: string,
  localAccountId: string,
): Promise<{ rows: PluggyPreviewRow[]; upToDate: boolean; fromDate?: string; toDate?: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Não autenticado');

  const { data, error } = await supabase.functions.invoke('pluggy-sync', {
    body: { pluggyItemId, localAccountId },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export async function commitPluggyRows(rows: PluggyPreviewRow[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const inserts: Record<string, unknown>[] = [];

  for (const row of rows) {
    const total = row.totalInstallments ?? 1;
    const groupId = total > 1
      ? (row.installmentGroupId ?? `pluggy-group:${row.pluggyId}`)
      : null;

    for (let i = 1; i <= total; i++) {
      inserts.push({
        user_id: user.id,
        type: row.type,
        amount: row.amount,
        payment_date: addMonths(row.paymentDate, i - 1),
        purchase_date: row.paymentDate,
        description: total > 1
          ? `${row.description} (${i}/${total})`
          : row.description,
        account_id: row.accountId,
        card_id: row.cardId ?? null,
        category_id: row.categoryId ?? null,
        notes: i === 1 ? row.pluggyId : `${row.pluggyId}:p${i}`,
        is_paid: i === 1 ? row.isPaid : false,
        is_fixed: false,
        installment_number: total > 1 ? i : null,
        total_installments: total > 1 ? total : null,
        installment_group_id: groupId,
      });
    }
  }

  const { error } = await supabase.from('transactions').insert(inserts);
  if (error) throw new Error(error.message);
}

export function usePluggySync() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [previewRows, setPreviewRows] = useState<PluggyPreviewRow[] | null>(null);

  const fetchMutation = useMutation({
    mutationFn: ({ pluggyItemId, localAccountId }: { pluggyItemId: string; localAccountId: string }) =>
      fetchPreview(pluggyItemId, localAccountId),
    onSuccess: (data) => {
      if (data.upToDate) {
        toast.success('Conta já está atualizada — nenhuma transação nova.');
        setPreviewRows([]);
      } else {
        setPreviewRows(data.rows);
      }
    },
    onError: (err: Error) => {
      toast.error(`Erro ao buscar dados: ${err.message}`);
    },
  });

  const commitMutation = useMutation({
    mutationFn: (rows: PluggyPreviewRow[]) => commitPluggyRows(rows),
    onSuccess: (_, rows) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success(`${rows.length} transação(ões) importada(s) com sucesso.`);
      setPreviewRows(null);
    },
    onError: (err: Error) => {
      toast.error(`Erro ao gravar: ${err.message}`);
    },
  });

  return {
    previewRows,
    setPreviewRows,
    fetchMutation,
    commitMutation,
  };
}
