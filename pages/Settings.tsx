import React, { useRef } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Download, Upload, Trash2, Database, AlertTriangle, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { exportData, importData, resetData, items, transactions } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importData(content);
          if (success && fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    const confirmText = prompt("Ketik 'DELETE' untuk menghapus semua data secara permanen.");
    if (confirmText === 'DELETE') {
      resetData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan & Data</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manajemen backup dan pemeliharaan sistem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Stats */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Database size={20} className="text-blue-600 dark:text-blue-400" /> Status Penyimpanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Total Barang</div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{items.length}</div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Total Transaksi</div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{transactions.length}</div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Storage Lokal</div>
               <div className="text-sm font-medium text-slate-800 dark:text-white mt-1">
                 Aktif (Browser)
               </div>
             </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Save size={20} className="text-emerald-600 dark:text-emerald-400" /> Backup & Restore
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Simpan data anda secara berkala untuk menghindari kehilangan data akibat pembersihan cache browser.</p>
           
           <div className="space-y-4">
             <button 
               onClick={exportData}
               className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
             >
               <Download size={20} />
               <div className="text-left">
                 <div className="font-semibold text-sm">Download Backup (JSON)</div>
                 <div className="text-xs opacity-75">Simpan semua data ke komputer anda</div>
               </div>
             </button>

             <div className="relative">
               <input 
                 type="file" 
                 accept=".json" 
                 ref={fileInputRef}
                 onChange={handleFileChange}
                 className="hidden"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
               >
                 <Upload size={20} />
                 <div className="text-left">
                   <div className="font-semibold text-sm">Restore Data</div>
                   <div className="text-xs opacity-75">Pulihkan dari file JSON</div>
                 </div>
               </button>
             </div>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
           <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tindakan di bawah ini bersifat destruktif dan tidak dapat dibatalkan.</p>
           
           <button 
             onClick={handleReset}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
           >
             <Trash2 size={18} />
             <span className="font-semibold">Reset Semua Data (Factory Reset)</span>
           </button>
        </div>
      </div>
    </div>
  );
};