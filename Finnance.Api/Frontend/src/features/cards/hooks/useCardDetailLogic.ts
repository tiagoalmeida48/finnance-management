import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCard, useCardInvoices, useCardStats } from './useCards';
import { useCardCycles } from './useCardCycles';
import type { CreditCardInvoice, StatementCycle } from '../types/cards.types';

function currentYear(): number {
  return new Date().getFullYear();
}

function openCycleOf(cycles: StatementCycle[] | undefined): StatementCycle | null {
  if (!cycles || cycles.length === 0) return null;
  const active = cycles.find((cycle) => cycle.active);
  return active ?? cycles[0];
}

export function useCardDetailLogic() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cardId = params.id ? Number(params.id) : null;

  const [isAllTime, setIsAllTime] = useState(false);
  const [year, setYear] = useState(() => currentYear());

  const cardQuery = useCard(cardId);
  const statsQuery = useCardStats(cardId);
  const cyclesQuery = useCardCycles(cardId);
  const invoicesQuery = useCardInvoices(cardId, isAllTime ? 0 : year);

  const invoices = useMemo<CreditCardInvoice[]>(() => {
    const data = invoicesQuery.data ?? [];
    return [...data].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [invoicesQuery.data]);

  const openCycle = useMemo(() => openCycleOf(cyclesQuery.data), [cyclesQuery.data]);

  const goBack = () => navigate('/finances');
  const prevYear = () => setYear((value) => value - 1);
  const nextYear = () => setYear((value) => value + 1);

  return {
    cardId,
    card: cardQuery.data ?? null,
    stats: statsQuery.data ?? null,
    openCycle,
    invoices,
    isLoading: cardQuery.isLoading,
    isError: cardQuery.isError,
    invoicesLoading: invoicesQuery.isLoading,
    isAllTime,
    setIsAllTime,
    year,
    prevYear,
    nextYear,
    goBack,
  };
}
