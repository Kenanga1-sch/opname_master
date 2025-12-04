export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'OPNAME_ADJUSTMENT';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: string;
  unit: string;
  currentStock: number;
  minStock: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes?: string;
  relatedOpnameId?: string;
  user?: string;
  createdAt: string;
}

export interface OpnameSession {
  id: string;
  date: string;
  status: 'OPEN' | 'COMPLETED';
  notes: string;
  items: OpnameItem[];
}

export interface OpnameItem {
  itemId: string;
  systemStock: number;
  physicalStock: number | null;
  difference: number;
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  anomalies: string[];
  lastAnalysisDate: string;
}

export interface DashboardMetrics {
  totalItems: number;
  lowStockCount: number;
  totalTransactions: number;
  pendingOpnames: number;
}