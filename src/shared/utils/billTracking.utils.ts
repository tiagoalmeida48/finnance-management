interface TrackingSummaryItem {
  total: number;
  isPaid: boolean;
}

export interface TrackingSummary {
  totalItems: number;
  paidItems: number;
  progress: number;
  totalAmount: number;
}

export const calculateTrackingSummary = (items: TrackingSummaryItem[]): TrackingSummary => {
  const totalItems = items.length;
  const paidItems = items.filter((item) => item.isPaid).length;
  const progress = totalItems > 0 ? (paidItems / totalItems) * 100 : 0;
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return {
    totalItems,
    paidItems,
    progress,
    totalAmount,
  };
};
