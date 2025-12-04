import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Item, Transaction, OpnameSession, Category, Notification, OpnameItem, Theme } from '../types';
import { StorageService } from '../services/storageService';

interface InventoryContextType {
  items: Item[];
  transactions: Transaction[];
  opnames: OpnameSession[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
  theme: Theme;
  
  // Actions
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  addOpname: (opname: OpnameSession) => void;
  updateOpname: (opname: OpnameSession) => void;
  finalizeOpname: (opname: OpnameSession) => void;
  
  // Category Actions
  addCategory: (name: string) => void;
  updateCategory: (id: string, newName: string) => void;
  deleteCategory: (id: string) => void;
  
  // Data Management
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetData: () => void;
  
  // Helpers
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  toggleTheme: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [opnames, setOpnames] = useState<OpnameSession[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('opname_theme');
      return (savedTheme as Theme) || 'light';
    }
    return 'light';
  });

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('opname_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Initial Load
    const loadData = () => {
      setItems(StorageService.getItems());
      setTransactions(StorageService.getTransactions());
      setOpnames(StorageService.getOpnames());
      setCategories(StorageService.getCategories());
      setLoading(false);
    };
    loadData();
  }, []);

  // Notification System
  const addNotification = (type: Notification['type'], message: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000); // Auto dismiss
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Item Actions
  const addItem = (item: Item) => {
    const updatedItems = [...items, item];
    setItems(updatedItems);
    StorageService.saveItems(updatedItems);
    addNotification('success', `Barang "${item.name}" berhasil ditambahkan.`);
  };

  const updateItem = (item: Item) => {
    const updatedItems = items.map(i => i.id === item.id ? item : i);
    setItems(updatedItems);
    StorageService.saveItems(updatedItems);
    addNotification('success', `Barang "${item.name}" berhasil diperbarui.`);
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(i => i.id !== id);
    setItems(updatedItems);
    StorageService.saveItems(updatedItems);
    addNotification('success', 'Barang berhasil dihapus.');
  };

  // Category Actions
  const addCategory = (name: string) => {
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      addNotification('error', 'Kategori dengan nama tersebut sudah ada.');
      return;
    }
    const newCategory: Category = { id: crypto.randomUUID(), name };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    StorageService.saveCategories(updatedCategories);
    addNotification('success', 'Kategori berhasil ditambahkan.');
  };

  const updateCategory = (id: string, newName: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const oldName = category.name;
    
    // 1. Update Category List
    const updatedCategories = categories.map(c => c.id === id ? { ...c, name: newName } : c);
    setCategories(updatedCategories);
    StorageService.saveCategories(updatedCategories);

    // 2. Cascade Update to Items (Since items store category name string)
    // Only update if name actually changed
    if (oldName !== newName) {
      const updatedItems = items.map(item => {
        if (item.category === oldName) {
          return { ...item, category: newName };
        }
        return item;
      });
      
      // Only save items if changes occurred
      if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
        setItems(updatedItems);
        StorageService.saveItems(updatedItems);
      }
    }

    addNotification('success', 'Kategori berhasil diperbarui.');
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    // Validation: Check if category is used
    const isUsed = items.some(i => i.category === category.name);
    if (isUsed) {
      addNotification('error', `Gagal menghapus. Kategori "${category.name}" masih digunakan oleh beberapa barang.`);
      return;
    }

    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    StorageService.saveCategories(updatedCategories);
    addNotification('success', 'Kategori berhasil dihapus.');
  };

  // Transaction Actions
  const addTransaction = (transaction: Transaction) => {
    // 1. Save Transaction
    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);
    StorageService.saveTransactions(updatedTransactions);

    // 2. Update Stock
    const qtyChange = transaction.type === 'IN' || transaction.type === 'OPNAME_ADJUSTMENT' ? transaction.quantity : -transaction.quantity;
    
    let finalChange = qtyChange;
    // Logic check mainly for history clarity, calculation handles by type above
    if (transaction.type === 'OUT') finalChange = -Math.abs(transaction.quantity);
    if (transaction.type === 'IN') finalChange = Math.abs(transaction.quantity);

    const targetItem = items.find(i => i.id === transaction.itemId);
    if (targetItem) {
      let newStock = targetItem.currentStock;
      if (transaction.type === 'IN') newStock += transaction.quantity;
      else if (transaction.type === 'OUT') newStock -= transaction.quantity;
      
      if (transaction.type === 'IN' || transaction.type === 'OUT') {
        const updatedItem = { 
          ...targetItem, 
          currentStock: newStock, 
          lastUpdated: new Date().toISOString() 
        };
        updateItem(updatedItem);
      }
    }
  };

  // Opname Actions
  const addOpname = (opname: OpnameSession) => {
    const updatedOpnames = [opname, ...opnames];
    setOpnames(updatedOpnames);
    StorageService.saveOpnames(updatedOpnames);
    addNotification('info', 'Sesi Stock Opname baru dibuat.');
  };

  const updateOpname = (opname: OpnameSession) => {
    const updatedOpnames = opnames.map(o => o.id === opname.id ? opname : o);
    setOpnames(updatedOpnames);
    StorageService.saveOpnames(updatedOpnames);
  };

  const finalizeOpname = (opname: OpnameSession) => {
    // 1. Close session
    const closedSession: OpnameSession = { ...opname, status: 'COMPLETED' };
    updateOpname(closedSession);

    // 2. Create Adjustment Transactions and Update Stocks
    const discrepancies = opname.items.filter(i => i.physicalStock !== null && i.difference !== 0);
    
    const newTransactions: Transaction[] = [];
    const itemsToUpdate: Item[] = [];
    // Use YYYY-MM-DD for consistency with manual transactions
    const transactionDate = new Date().toISOString().split('T')[0];

    discrepancies.forEach(d => {
      // Transaction Record
      newTransactions.push({
        id: crypto.randomUUID(),
        itemId: d.itemId,
        type: 'OPNAME_ADJUSTMENT',
        quantity: Math.abs(d.difference),
        date: transactionDate,
        notes: `Opname Adjustment: System(${d.systemStock}) -> Physical(${d.physicalStock})`,
        relatedOpnameId: opname.id,
        createdAt: new Date().toISOString()
      });

      // Stock Update
      const item = items.find(i => i.id === d.itemId);
      if (item && d.physicalStock !== null) {
        itemsToUpdate.push({
          ...item,
          currentStock: d.physicalStock, // Force set to physical count
          lastUpdated: new Date().toISOString()
        });
      }
    });

    // Batch update to avoid multiple re-renders
    if (newTransactions.length > 0) {
      const updatedTransactions = [...newTransactions, ...transactions];
      setTransactions(updatedTransactions);
      StorageService.saveTransactions(updatedTransactions);
    }

    if (itemsToUpdate.length > 0) {
      const itemMap = new Map(itemsToUpdate.map(i => [i.id, i]));
      const updatedItems = items.map(i => itemMap.get(i.id) || i);
      setItems(updatedItems);
      StorageService.saveItems(updatedItems);
    }

    addNotification('success', `Stock Opname selesai. ${itemsToUpdate.length} stok barang disesuaikan.`);
  };

  // Data Management
  const exportData = () => {
    const data = {
      items,
      transactions,
      opnames,
      categories,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opname_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('success', 'Backup data berhasil diunduh.');
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      // Basic validation
      if (!data.items || !data.transactions) {
        throw new Error('Format file tidak valid');
      }

      setItems(data.items);
      setTransactions(data.transactions);
      setOpnames(data.opnames || []);
      setCategories(data.categories || StorageService.getCategories());
      
      StorageService.saveItems(data.items);
      StorageService.saveTransactions(data.transactions);
      StorageService.saveOpnames(data.opnames || []);
      StorageService.saveCategories(data.categories || StorageService.getCategories());
      
      addNotification('success', 'Data berhasil dipulihkan.');
      return true;
    } catch (e) {
      console.error(e);
      addNotification('error', 'Gagal memulihkan data. File korup atau format salah.');
      return false;
    }
  };

  const resetData = () => {
    localStorage.clear();
    setItems([]);
    setTransactions([]);
    setOpnames([]);
    setCategories([]);
    addNotification('warning', 'Semua data telah dihapus (Factory Reset).');
    setTimeout(() => window.location.reload(), 1500);
  };

  // Memoize the context value to prevent unnecessary re-renders in consumers
  const contextValue = useMemo(() => ({
    items, transactions, opnames, categories, notifications, loading, theme,
    addItem, updateItem, deleteItem,
    addTransaction, addOpname, updateOpname, finalizeOpname,
    addCategory, updateCategory, deleteCategory,
    exportData, importData, resetData,
    addNotification, removeNotification, toggleTheme
  }), [items, transactions, opnames, categories, notifications, loading, theme]);

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};