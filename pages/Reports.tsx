import React from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatNumber } from '../utils/formatters';
import { Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const { transactions, items, theme } = useInventory();

  // Prepare data for Usage Trend (Last 7 days OUT transactions)
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const usageTrendData = getLast7Days().map(date => {
    const count = transactions
      .filter(t => {
          const tDate = t.date.split('T')[0];
          return t.type === 'OUT' && tDate === date;
      })
      .reduce((sum, t) => sum + t.quantity, 0);
    return { date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short'}), totalUsage: count };
  });

  // Prepare data for Category Distribution
  const categoryDataRaw = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryDataRaw).map(key => ({
    name: key,
    value: categoryDataRaw[key]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f1f5f9', '#ef4444', '#8b5cf6', '#ec4899'];
  const COLORS_DARK = ['#3b82f6', '#10b981', '#334155', '#ef4444', '#8b5cf6', '#ec4899'];

  const downloadCSV = () => {
    // Header
    const headers = ['Tanggal', 'Tipe', 'SKU', 'Nama Barang', 'Jumlah', 'Keterangan'];
    
    // Rows
    const rows = transactions.map(t => {
      const item = items.find(i => i.id === t.itemId);
      return [
        t.date.split('T')[0],
        t.type,
        item?.sku || 'N/A',
        `"${item?.name || 'Unknown'}"`, // Quote name to handle commas
        t.quantity,
        `"${t.notes || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Laporan & Analitik</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Visualisasi data penggunaan dan distribusi inventaris.</p>
         </div>
         <button 
           onClick={downloadCSV}
           className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
         >
           <Download size={16} /> Export CSV
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Usage Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-6">Tren Pemakaian (7 Hari Terakhir)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageTrendData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="date" tick={{fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#000',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Area type="monotone" dataKey="totalUsage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-6">Distribusi Kategori Barang</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={theme === 'dark' ? COLORS_DARK[index % COLORS_DARK.length] : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Transaction Summary Table */}
       <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
           <h3 className="font-bold text-slate-700 dark:text-slate-200">Top 5 Barang Paling Banyak Digunakan</h3>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                    <th className="px-6 py-3 font-medium">Nama Barang</th>
                    <th className="px-6 py-3 text-right font-medium">Total Keluar</th>
                    <th className="px-6 py-3 font-medium">Kategori</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items
                    .map(item => ({
                        ...item,
                        totalOut: transactions
                            .filter(t => t.itemId === item.id && t.type === 'OUT')
                            .reduce((sum, t) => sum + t.quantity, 0)
                    }))
                    .sort((a, b) => b.totalOut - a.totalOut)
                    .slice(0, 5)
                    .map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                {item.name}
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-orange-600 dark:text-orange-400">{formatNumber(item.totalOut)}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                                    {item.category}
                                </span>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
      </div>
    </div>
  );
};