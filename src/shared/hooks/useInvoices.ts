import { useQuery } from '@tanstack/react-query';
import { invoicesService } from '../services/invoices.service';
import { queryKeys } from '../constants/queryKeys';

export function useCardInvoices(cardId: string | undefined, filters?: { year?: string }) {
    return useQuery({
        queryKey: [...queryKeys.cards.details(cardId ?? ''), 'invoices', filters],
        queryFn: () => invoicesService.getByCardId(cardId!, filters),
        enabled: !!cardId,
    });
}
