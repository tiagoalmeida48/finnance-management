export type TrackingItemType = 'card' | 'fixed';

export interface TrackingItem {
  id: number;
  name: string;
  total: number;
  isPaid: boolean;
  itemType: TrackingItemType;
  account: number | null;
}

export interface MonthlyTrackingData {
  month: Date;
  monthName: string;
  items: TrackingItem[];
  progress: number;
  totalItems: number;
  paidItems: number;
  totalAmount: number;
}

export interface PayItemInput {
  account: number | null;
}
