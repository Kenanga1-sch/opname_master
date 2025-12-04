import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { TransactionType } from '../types';
import { ArrowDownCircle, ArrowUpCircle, Plus, Search, Filter, XCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/formatters';

export const Transactions: React.FC = () => {
  const { transactions, items, addTransaction, addNotification } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    itemId: string;
    type: TransactionType;
    quantity: string; // Use string for input handling, parse on submit
    notes: string;
    date: string;
  }>({
    itemId: '',
    type: 'IN',
    quantity: '1',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity);

    if (!formData.itemId) {
      addNotification('error', 'Silakan pilih barang terlebih dahulu.');
      return;
    }
    
    if (isNaN(qty) || qty <= 0) {
      addNotification('error', 'Jumlah barang harus lebih dari 0.');
      return;
    }

    // Optional: Check if stock is sufficient for OUT transaction
    if (formData.type === 'OUT') {
      const item = items.find(i => i.id === formData.itemId);
      if (item && item.currentStock < qty) {
        if (!window.confirm(`Stok saat ini (${item.currentStock}) kurang dari jumlah keluar (${qty}). Lanjutkan hingga stok minus?`)) {
          return;
        }
      }
    }

    addTransaction({
      id: crypto.randomUUID(),
      itemId: formData.itemId,
      type: formData.type,
      quantity: qty,
      date: formData.date,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    });
    
    addNotification('success', 'Transaksi berhasil dicatat.');
    setIsModalOpen(false);
    setFormData({ itemId: '', type: 'IN', quantity: '1', notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown Item';
  const getItemSku = (id: string) => items.find(i => i.id === id)?.sku || '---';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const filteredTransactions = transactions.filter(t => {
    const itemName = getItemName(t.itemId).toLowerCase();
    const matchesSearch = itemName.includes(searchTerm.toLowerCase()) || t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    
    let matchesDate = true;
    const tDate = t.date.split('T')[0];
    if (startDate) matchesDate = matchesDate && tDate >= startDate;
    if (endDate) matchesDate = matchesDate && tDate <= endDate;

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat Transaksi</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Catat barang masuk dan keluar.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Catat Transaksi
        </button>
      </div>

       {/* Filter Bar */}
       <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Cari transaksi..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
              >
                <option value="ALL">Semua Tipe</option>
                <option value="IN">Masuk (IN)</option>
                <option value="OUT">Keluar (OUT)</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3 items-center border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-sm text-slate-500 flex items-center gap-2">
               <Filter size={16} /> Filter Tanggal:
            </div>
            <input 
              type="date" 
              className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            
            {(searchTerm || filterType !== 'ALL' || startDate || endDate) && (
              <button onClick={resetFilters} className="ml-auto text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <XCircle size={14} /> Reset Filter
              </button>
            )}
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold w-fit border ${
                      t.type === 'IN' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30' : 
                      t.type === 'OUT' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                    }`}>
                      {t.type === 'IN' ? <ArrowDownCircle size={14}/> : <ArrowUpCircle size={14}/>}
                      {t.type === 'IN' ? 'MASUK' : t.type === 'OUT' ? 'KELUAR' : 'ADJUST'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{getItemName(t.itemId)}</div>
                    <div className="text-xs text-slate-400 font-mono">{getItemSku(t.itemId)}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{t.quantity}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 italic truncate max-w-xs">{t.notes || '-'}</td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada transaksi yang sesuai filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Transaksi Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                <input type="date" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipe Transaksi</label>
                <div className="flex gap-4 p-1">
                  <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg border transition-all ${formData.type === 'IN' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <input type="radio" name="type" value="IN" checked={formData.type === 'IN'} 
                      onChange={() => setFormData({...formData, type: 'IN'})} className="hidden" />
                    <ArrowDownCircle size={18} />
                    <span>Masuk (Restock)</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg border transition-all ${formData.type === 'OUT' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <input type="radio" name="type" value="OUT" checked={formData.type === 'OUT'} 
                      onChange={() => setFormData({...formData, type: 'OUT'})} className="hidden" />
                    <ArrowUpCircle size={18} />
                    <span>Keluar (Pakai)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Barang</label>
                <select required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                  <option value="">-- Pilih Barang --</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.sku} - {i.name} (Stok: {i.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                  value={formData.quantity} 
                  onChange={e => setFormData({...formData, quantity: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan / Tujuan</label>
                <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" rows={3}
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Contoh: Pembelian bulanan atau Pemakaian Divisi IT"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Simpan</button>
              </div>
        </form>
      </Modal>
    </div>
  );
};