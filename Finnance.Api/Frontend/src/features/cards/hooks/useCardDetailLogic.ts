import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCard, useCardInvoices, useCardStats } from './useCards';
import { useCardCycles } from './useCardCycles';
import type { CreditCardInvoice, StatementCycle } from '../types/cards.types';

const INVOICES_PAGE_SIZE = 12;

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

  const [isAllTime, setIsAllTimeState] = useState(false);
  const [year, setYear] = useState(() => currentYear());
  const [offset, setOffset] = useState(0);

  const cardQuery = useCard(cardId);
  const statsQuery = useCardStats(cardId);
  const cyclesQuery = useCardCycles(cardId);
  const invoicesQuery = useCardInvoices(cardId, isAllTime ? 0 : year, INVOICES_PAGE_SIZE, offset);

  const invoices = useMemo<CreditCardInvoice[]>(
    () => invoicesQuery.data?.items ?? [],
    [invoicesQuery.data],
  );
  const invoicesTotalCount = invoicesQuery.data?.totalCount ?? 0;
  const invoicesHasNextPage = invoicesQuery.data?.hasNextPage ?? false;

  const openCycle = useMemo(() => openCycleOf(cyclesQuery.data), [cyclesQuery.data]);

  const goBack = () => navigate('/finances');
  const setIsAllTime = (value: boolean) => {
    setIsAllTimeState(value);
    setOffset(0);
  };
  const prevYear = () => {
    setYear((value) => value - 1);
    setOffset(0);
  };
  const nextYear = () => {
    setYear((value) => value + 1);
    setOffset(0);
  };
  const prevInvoicesPage = () => setOffset((value) => Math.max(0, value - INVOICES_PAGE_SIZE));
  const nextInvoicesPage = () => setOffset((value) => value + INVOICES_PAGE_SIZE);

  return {
    cardId,
    card: cardQuery.data ?? null,
    stats: statsQuery.data ?? null,
    openCycle,
    invoices,
    invoicesTotalCount,
    invoicesHasNextPage,
    invoicesOffset: offset,
    prevInvoicesPage,
    nextInvoicesPage,
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
