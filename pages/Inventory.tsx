import React, { useState, useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Item, Category } from '../types';
import { Plus, Search, Edit2, Trash2, FolderCog, Save, X, Filter, XCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const Inventory: React.FC = () => {
  const { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory } = useInventory();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'ALL' | 'SAFE' | 'LOW' | 'OUT'>('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State for Item
  const [formData, setFormData] = useState<Partial<Item>>({
    sku: '', name: '', category: '', location: '', unit: 'Pcs', currentStock: 0, minStock: 5
  });

  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Derived Data: Unique Locations
  const uniqueLocations = useMemo(() => {
    const locs = items.map(i => i.location).filter(Boolean);
    return Array.from(new Set(locs)).sort();
  }, [items]);

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      // Set default category to first available if exists
      setFormData({ 
        sku: '', 
        name: '', 
        category: categories.length > 0 ? categories[0].name : '', 
        location: '', 
        unit: 'Pcs', 
        currentStock: 0, 
        minStock: 5 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (editingItem) {
      updateItem({ ...editingItem, ...formData } as Item);
    } else {
      addItem({
        id: crypto.randomUUID(),
        lastUpdated: new Date().toISOString(),
        ...formData as Item
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah anda yakin ingin menghapus item ini?')) {
      deleteItem(id);
    }
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const saveEditCategory = (id: string) => {
    if (editingCategoryName.trim()) {
      updateCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName('');
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Hapus kategori ini?')) {
      deleteCategory(id);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
    setFilterStockStatus('ALL');
  };

  // Advanced Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Text Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower);

      // 2. Category Filter
      const matchesCategory = filterCategory ? item.category === filterCategory : true;

      // 3. Location Filter
      const matchesLocation = filterLocation ? item.location === filterLocation : true;

      // 4. Stock Status Filter
      let matchesStock = true;
      if (filterStockStatus === 'LOW') {
        matchesStock = item.currentStock <= item.minStock && item.currentStock > 0;
      } else if (filterStockStatus === 'OUT') {
        matchesStock = item.currentStock === 0;
      } else if (filterStockStatus === 'SAFE') {
        matchesStock = item.currentStock > item.minStock;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStock;
    });
  }, [items, searchTerm, filterCategory, filterLocation, filterStockStatus]);

  const hasActiveFilters = searchTerm || filterCategory || filterLocation || filterStockStatus !== 'ALL';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Inventaris</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola katalog barang habis pakai.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 shadow-sm transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FolderCog size={18} /> <span className="hidden sm:inline">Kelola Kategori</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={18} /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium pb-2 border-b border-slate-100 dark:border-slate-800">
          <Filter size={18} className="text-blue-600 dark:text-blue-400" />
          Filter & Pencarian
          {hasActiveFilters && (
            <button 
              onClick={resetFilters} 
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
            >
              <XCircle size={12} /> Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Search Text */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari Nama / SKU..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 2. Category Filter */}
          <div>
            <select 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Location Filter */}
          <div>
             <select 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="">Semua Lokasi</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

           {/* 4. Stock Status Filter */}
           <div>
             <select 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value as any)}
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="SAFE">✅ Aman</option>
              <option value="LOW">⚠️ Menipis (Low Stock)</option>
              <option value="OUT">❌ Habis (Out of Stock)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-center">Satuan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    {item.name}
                    {item.currentStock <= item.minStock && (
                       <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Stok Menipis"></span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.location}</td>
                  <td className={`px-6 py-4 text-center font-bold ${item.currentStock <= item.minStock ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">{item.unit}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-20" />
                    <span>Tidak ada barang yang cocok dengan filter</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
           <span>Menampilkan {filteredItems.length} barang</span>
           <span>Total Keseluruhan: {items.length} barang</span>
        </div>
      </div>

      {/* Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU / Kode</label>
                  <input type="text" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Pilih...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Barang</label>
                <input type="text" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lokasi Rak</label>
                  <input type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                  <input type="text" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                  <input type="number" min="0" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
                    disabled={!!editingItem} 
                  />
                  {editingItem && <p className="text-[10px] text-slate-400 mt-1">Gunakan menu Transaksi untuk update stok</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min. Stok</label>
                  <input type="number" min="0" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Simpan</button>
              </div>
        </form>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Kelola Kategori Barang"
      >
        <div className="space-y-6">
          {/* Add Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nama kategori baru..." 
              required
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors">
              <Plus size={20} />
            </button>
          </form>

          {/* List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 group">
                {editingCategoryId === cat.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <input 
                      type="text" 
                      className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      value={editingCategoryName}
                      onChange={e => setEditingCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => saveEditCategory(cat.id)} className="text-green-600 hover:text-green-700 p-1"><Save size={16}/></button>
                    <button onClick={() => setEditingCategoryId(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={16}/></button>
                  </div>
                ) : (
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                )}
                
                {editingCategoryId !== cat.id && (
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCategory(cat)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">Belum ada kategori.</p>
            )}
          </div>
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
             <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};