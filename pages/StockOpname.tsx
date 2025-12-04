import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { OpnameSession, OpnameItem } from '../types';
import { ClipboardCheck, Play, Save, CheckCircle2, ChevronRight, AlertCircle, Eye, EyeOff, FileText, XCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';

export const StockOpname: React.FC = () => {
  const { items, opnames, addOpname, updateOpname, finalizeOpname } = useInventory();
  const [activeSession, setActiveSession] = useState<OpnameSession | null>(null);
  
  // View mode: 'LIST' | 'DETAIL'
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [blindMode, setBlindMode] = useState(false);
  
  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);

  const startNewSession = () => {
    // Snapshot current stock system
    const opnameItems: OpnameItem[] = items.map(item => ({
      itemId: item.id,
      systemStock: item.currentStock,
      physicalStock: null,
      difference: 0
    }));

    const newSession: OpnameSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'OPEN',
      notes: `SO-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${new Date().getDate().toString().padStart(2,'0')}`,
      items: opnameItems
    };

    addOpname(newSession);
    setActiveSession(newSession);
    setView('DETAIL');
  };

  const updateCount = (itemId: string, val: number) => {
    if (!activeSession) return;
    
    // Handle NaN (if input is cleared) as null or 0, here logic prefers keeping null if empty for "uncounted"
    // But since type is number | null, and val comes from parseInt, we check isNaN
    const physicalVal = isNaN(val) ? null : val;

    const updatedItems = activeSession.items.map(item => {
      if (item.itemId === itemId) {
        return {
          ...item,
          physicalStock: physicalVal,
          difference: physicalVal !== null ? physicalVal - item.systemStock : 0
        };
      }
      return item;
    });

    const updatedSession = { ...activeSession, items: updatedItems };
    setActiveSession(updatedSession);
    updateOpname(updatedSession);
  };

  const handleFinalize = () => {
    if (!activeSession) return;
    if (!window.confirm("Selesaikan Stock Opname? Stok sistem akan disesuaikan dengan stok fisik.")) return;

    finalizeOpname(activeSession);
    setActiveSession(prev => prev ? ({ ...prev, status: 'COMPLETED' }) : null);
    
    // Automatically open report after finalize
    setTimeout(() => setIsReportOpen(true), 500);
  };

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || id;
  const getItemSku = (id: string) => items.find(i => i.id === id)?.sku || '---';

  // --- REPORT GENERATION LOGIC ---
  const getDiscrepancies = () => {
    if (!activeSession) return [];
    return activeSession.items.filter(i => i.physicalStock !== null && i.difference !== 0);
  };

  const getAccuracyRate = () => {
    if (!activeSession || activeSession.items.length === 0) return 0;
    const countedItems = activeSession.items.filter(i => i.physicalStock !== null);
    if (countedItems.length === 0) return 0;
    
    const correctItems = countedItems.filter(i => i.difference === 0).length;
    return Math.round((correctItems / countedItems.length) * 100);
  };

  // Render List View
  if (view === 'LIST') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Stock Opname</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Audit fisik stok barang.</p>
          </div>
          <button 
            onClick={startNewSession}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
          >
            <Play size={18} /> Mulai Opname Baru
          </button>
        </div>

        <div className="grid gap-4">
          {opnames.map(session => (
            <div 
              key={session.id} 
              onClick={() => { setActiveSession(session); setView('DETAIL'); }}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${session.status === 'OPEN' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
              <div className="flex justify-between items-center pl-2">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${session.status === 'OPEN' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{session.notes}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(session.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                     <div className="text-xs text-slate-400">Status</div>
                     <span className={`text-sm font-bold ${
                        session.status === 'OPEN' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {session.status === 'OPEN' ? 'SEDANG BERJALAN' : 'SELESAI'}
                      </span>
                  </div>
                  <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-8 text-sm pl-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Total Item</span> 
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-lg">{session.items.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Selisih Ditemukan</span> 
                  <span className={`font-medium text-lg ${session.items.some(i => i.physicalStock !== null && i.difference !== 0) ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {session.items.filter(i => i.physicalStock !== null && i.difference !== 0).length}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {opnames.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
               <div className="inline-flex bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                 <ClipboardCheck className="text-slate-300 dark:text-slate-600" size={32} />
               </div>
              <p className="text-slate-500 dark:text-slate-400">Belum ada riwayat stock opname.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Detail/Active View
  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
            &larr; Kembali
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {activeSession?.notes}
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border ${activeSession?.status === 'OPEN' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400'}`}>
                {activeSession?.status}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeSession?.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Action Buttons for OPEN Session */}
          {activeSession?.status === 'OPEN' && (
            <>
             <button 
               onClick={() => setBlindMode(!blindMode)}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${blindMode ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
               title="Blind Mode menyembunyikan stok sistem agar perhitungan lebih objektif"
             >
               {blindMode ? <EyeOff size={16}/> : <Eye size={16}/>}
               {blindMode ? 'Blind Mode: ON' : 'Blind Mode: OFF'}
             </button>

             <button 
                onClick={handleFinalize}
                className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm font-medium transition-colors"
              >
                <CheckCircle2 size={18} /> Selesai
              </button>
            </>
          )}

          {/* Action Buttons for COMPLETED Session */}
          {activeSession?.status === 'COMPLETED' && (
             <button 
               onClick={() => setIsReportOpen(true)}
               className="flex-1 md:flex-none bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800 transition-colors"
             >
               <FileText size={18} /> Lihat Laporan Hasil
             </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Lembar Kerja Opname</h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Progress: <span className="font-bold text-blue-600 dark:text-blue-400">{activeSession?.items.filter(i => i.physicalStock !== null).length}</span> / {activeSession?.items.length} Item
            </div>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4 w-1/3">Barang</th>
                <th className="px-6 py-4 text-center w-32">Stok Sistem</th>
                <th className="px-6 py-4 text-center w-40">Stok Fisik</th>
                <th className="px-6 py-4 text-center w-32">Selisih</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeSession?.items.map(opItem => {
                const isCounted = opItem.physicalStock !== null;
                const hasDiff = opItem.difference !== 0;
                
                return (
                  <tr key={opItem.itemId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isCounted && hasDiff ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{getItemName(opItem.itemId)}</div>
                      <div className="text-xs text-slate-400 font-mono">{getItemSku(opItem.itemId)}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-mono">
                      {blindMode && activeSession.status === 'OPEN' ? (
                          <span className="text-slate-300 dark:text-slate-600 select-none">???</span>
                      ) : (
                          opItem.systemStock
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number" 
                        min="0"
                        disabled={activeSession.status === 'COMPLETED'}
                        value={opItem.physicalStock ?? ''} 
                        onChange={(e) => updateCount(opItem.itemId, parseInt(e.target.value))}
                        className={`w-28 text-center border rounded-lg py-1.5 px-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all
                          ${isCounted ? 'border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'}
                          dark:text-white
                        `}
                        placeholder="..."
                      />
                    </td>
                    <td className={`px-6 py-4 text-center font-bold ${hasDiff ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'}`}>
                      {isCounted ? (opItem.difference > 0 ? `+${opItem.difference}` : opItem.difference) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isCounted ? (
                         hasDiff ? 
                          <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-xs font-bold border border-red-200 dark:border-red-800"><AlertCircle size={12}/> SELISIH</span> : 
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs font-bold border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={12}/> COCOK</span>
                       ) : (
                         <span className="text-slate-300 dark:text-slate-600 text-xs italic">Menunggu input</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT REPORT MODAL */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Laporan Ringkasan Opname"
      >
        <div className="space-y-6">
           <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{activeSession?.notes}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tanggal Finalisasi: {formatDateTime(new Date().toISOString())}</p>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                 <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Akurasi Stok</div>
                 <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{getAccuracyRate()}%</div>
              </div>
              <div className="text-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                 <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Item Selisih</div>
                 <div className="text-xl font-bold text-red-600 dark:text-red-400">{getDiscrepancies().length}</div>
              </div>
              <div className="text-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                 <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Item</div>
                 <div className="text-xl font-bold text-slate-800 dark:text-white">{activeSession?.items.length}</div>
              </div>
           </div>

           <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
             <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <AlertCircle size={18} className="text-red-500" /> Rincian Selisih & Penyesuaian
             </h4>
             
             {getDiscrepancies().length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  Luar biasa! Tidak ada selisih stok ditemukan.<br/>
                  Data fisik dan sistem cocok 100%.
                </div>
             ) : (
                <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs sticky top-0">
                      <tr>
                        <th className="px-4 py-2">Barang</th>
                        <th className="px-4 py-2 text-center">Sistem</th>
                        <th className="px-4 py-2 text-center">Fisik</th>
                        <th className="px-4 py-2 text-center">Adj.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {getDiscrepancies().map(item => (
                        <tr key={item.itemId}>
                          <td className="px-4 py-2">
                             <div className="font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{getItemName(item.itemId)}</div>
                          </td>
                          <td className="px-4 py-2 text-center text-slate-500 dark:text-slate-400">{item.systemStock}</td>
                          <td className="px-4 py-2 text-center font-bold text-slate-700 dark:text-slate-200">{item.physicalStock}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`flex items-center justify-center gap-1 font-bold ${item.difference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {item.difference > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                              {item.difference > 0 ? `+${item.difference}` : item.difference}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             )}
           </div>

           <div className="flex justify-end pt-2">
             <button onClick={() => setIsReportOpen(false)} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-slate-600">
               Tutup
             </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};