import React, { useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Package, AlertTriangle, ClipboardList, Activity, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useInventory } from '../contexts/InventoryContext';
import { formatNumber } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { items, transactions, opnames, theme } = useInventory();
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const runAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await GeminiService.analyzeInventory(items, transactions);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const lowStockItems = items.filter(i => i.currentStock <= i.minStock);
  const openOpnames = opnames.filter(o => o.status === 'OPEN');
  
  const stockChartData = [...items]
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5)
    .map(i => ({ name: i.name, stock: i.currentStock }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Executive Dashboard</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Ringkasan operasional dan kesehatan inventaris.</p>
        </div>
        <button 
          onClick={runAiAnalysis}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 disabled:shadow-none"
        >
          {loadingAi ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
          <span className="font-medium">{loadingAi ? 'Menganalisis...' : 'AI Smart Insights'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total SKU Barang" 
          value={formatNumber(items.length)} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Stok Kritis" 
          value={lowStockItems.length} 
          icon={AlertTriangle} 
          color={lowStockItems.length > 0 ? "bg-red-500" : "bg-emerald-500"}
          subtext={lowStockItems.length > 0 ? "Perlu tindakan segera" : "Stok dalam kondisi aman"}
        />
        <StatCard 
          title="Opname Aktif" 
          value={openOpnames.length} 
          icon={ClipboardList} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Transaksi" 
          value={formatNumber(transactions.length)} 
          icon={Activity} 
          color="bg-teal-500" 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Analysis Card */}
          {(aiAnalysis || loadingAi) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
              {loadingAi && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse"></div>}
              <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 px-6 py-4 border-b border-indigo-50 dark:border-indigo-900/30 flex items-center gap-2">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Gemini Inventory Intelligence</h3>
              </div>
              <div className="p-6">
                {loadingAi ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-5">
                    <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 p-4 rounded-xl shadow-sm text-slate-700 dark:text-slate-300 text-sm leading-relaxed relative">
                      <span className="text-4xl absolute -top-2 -left-2 text-indigo-200 dark:text-indigo-800">"</span>
                      <p className="pl-4">{aiAnalysis.summary}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                        <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <TrendingUp size={14} /> Prioritas Restock
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                  {rec}
                              </li>
                          ))}
                          {aiAnalysis.recommendations.length === 0 && <li className="text-sm text-slate-500 italic">Tidak ada rekomendasi.</li>}
                        </ul>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertTriangle size={14} /> Anomali Terdeteksi
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.anomalies.map((ano, i) => (
                              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                  {ano}
                              </li>
                          ))}
                          {aiAnalysis.anomalies.length === 0 && <li className="text-sm text-slate-500 italic">Tidak ada anomali.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top 5 Inventory Levels</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} interval={0} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: theme === 'dark' ? '#1e293b' : '#f8fafc'}}
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#000',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Low Stock List */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-0 overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/20">
              <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} className="fill-red-100 dark:fill-red-900" />
                Peringatan Stok Rendah
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {lowStockItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
                  <Package size={48} className="text-slate-200 dark:text-slate-700" />
                  <p className="text-sm font-medium">Stok aman terkendali</p>
                </div>
              ) : (
                <div className="space-y-2">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-50 dark:border-slate-800 hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                         <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Min: {item.minStock} {item.unit}</div>
                         </div>
                         <div className="text-right">
                            <div className="text-red-600 dark:text-red-400 font-bold text-lg">{item.currentStock}</div>
                            <div className="text-[10px] text-red-500 dark:text-red-300 font-medium bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">CRITICAL</div>
                         </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {lowStockItems.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">Lihat Semua di Data Barang &rarr;</button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};