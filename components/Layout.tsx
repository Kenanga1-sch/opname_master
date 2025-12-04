import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './ui/Toast';
import { useInventory } from '../contexts/InventoryContext';
import { Menu, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { notifications, removeNotification, theme, toggleTheme } = useInventory();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 h-full">
        {/* Header (Mobile + Desktop Theme Toggle) */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
           <div className="flex items-center gap-3 md:hidden">
             <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
               <Menu size={24} />
             </button>
             <div className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-1">
               <span className="text-blue-600 dark:text-blue-500">Opname</span>Master
             </div>
           </div>

           {/* Right Side Header Items */}
           <div className="flex items-center gap-3 ml-auto">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin Gudang</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">admin@opnamemaster.com</span>
             </div>
             
             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

             <button 
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
               aria-label="Toggle Dark Mode"
             >
               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto pb-10 animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      </div>
    </div>
  );
};