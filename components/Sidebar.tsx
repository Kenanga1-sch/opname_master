import React from 'react';
import { LayoutDashboard, Package, ArrowRightLeft, ClipboardCheck, BarChart3, Settings, X } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, toggleSidebar }) => {
  const { theme } = useInventory();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Data Barang', icon: Package },
    { id: 'transactions', label: 'Transaksi', icon: ArrowRightLeft },
    { id: 'stock-opname', label: 'Stock Opname', icon: ClipboardCheck },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out 
        bg-white dark:bg-slate-900 
        w-64 z-40 flex flex-col shadow-2xl md:shadow-none border-r border-slate-200 dark:border-slate-800
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Opname<span className="text-blue-600 dark:text-blue-500">Master</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                activePage === item.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${
                activePage === item.id 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              }`} />
              <span>{item.label}</span>
              {activePage === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-l-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
             <div className="text-xs text-slate-500 dark:text-slate-400">Versi Sistem</div>
             <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">v2.5 Pro</div>
          </div>
        </div>
      </div>
    </>
  );
};