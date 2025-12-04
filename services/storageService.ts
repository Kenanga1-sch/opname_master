import { Item, Transaction, OpnameSession, Category } from '../types';

const KEYS = {
  ITEMS: 'opname_items',
  TRANSACTIONS: 'opname_transactions',
  OPNAMES: 'opname_sessions',
  CATEGORIES: 'opname_categories',
};

// Seed Data
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'ATK (Alat Tulis Kantor)' },
  { id: '2', name: 'Pembersih' },
  { id: '3', name: 'Pantry' },
  { id: '4', name: 'Elektronik' },
];

const INITIAL_ITEMS: Item[] = [
  { id: '1', sku: 'ATK-001', name: 'Kertas A4 70gr', category: 'ATK (Alat Tulis Kantor)', location: 'Rak A1', unit: 'Rim', currentStock: 50, minStock: 10, lastUpdated: new Date().toISOString() },
  { id: '2', sku: 'ATK-002', name: 'Pulpen Hitam Standard', category: 'ATK (Alat Tulis Kantor)', location: 'Rak A2', unit: 'Pcs', currentStock: 120, minStock: 24, lastUpdated: new Date().toISOString() },
  { id: '3', sku: 'CLN-001', name: 'Cairan Pembersih Lantai', category: 'Pembersih', location: 'Gudang B', unit: 'Jerigen 5L', currentStock: 4, minStock: 5, lastUpdated: new Date().toISOString() },
  { id: '4', sku: 'PNT-001', name: 'Gula Pasir', category: 'Pantry', location: 'Dapur', unit: 'Kg', currentStock: 2, minStock: 5, lastUpdated: new Date().toISOString() },
];

export const StorageService = {
  getItems: (): Item[] => {
    try {
      const data = localStorage.getItem(KEYS.ITEMS);
      return data ? JSON.parse(data) : INITIAL_ITEMS;
    } catch (e) {
      console.error("Failed to load items", e);
      return [];
    }
  },

  saveItems: (items: Item[]) => {
    try {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save items", e);
      throw new Error("Gagal menyimpan data barang.");
    }
  },

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load transactions", e);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getOpnames: (): OpnameSession[] => {
    const data = localStorage.getItem(KEYS.OPNAMES);
    return data ? JSON.parse(data) : [];
  },

  saveOpnames: (opnames: OpnameSession[]) => {
    localStorage.setItem(KEYS.OPNAMES, JSON.stringify(opnames));
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  }
};