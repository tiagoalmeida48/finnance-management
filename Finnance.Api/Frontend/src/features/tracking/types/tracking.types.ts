export type TrackingItemType = 'card' | 'fixed';

export interface TrackingItem {
  id: number;
  name: string;
  total: number;
  isPaid: boolean;
  itemType: TrackingItemType;
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

export interface TrackingSummary {
  totalItems: number;
  paidItems: number;
  progress: number;
  totalAmount: number;
}

export interface PayItemInput {
  account: number | null;
}
