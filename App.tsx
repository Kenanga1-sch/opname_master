import React, { useState } from 'react';
import { InventoryProvider } from './contexts/InventoryContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Transactions } from './pages/Transactions';
import { StockOpname } from './pages/StockOpname';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'transactions': return <Transactions />;
      case 'stock-opname': return <StockOpname />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </ErrorBoundary>
  );
};

export default App;