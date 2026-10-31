/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { AccessRestricted } from './components/AccessRestricted';

import { KanbanBoard } from './components/KanbanBoard';
import { SubscriptionList } from './components/SubscriptionList';
import { ProductCatalog } from './components/ProductCatalog';
import { QuotationManager } from './components/QuotationManager';
import { BillingEngineView } from './components/BillingEngineView';
import { InvoicesView } from './components/InvoicesView';
import { DiscountRulesView } from './components/DiscountRulesView';
import { FinanceDashboard } from './components/FinanceDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { StaffIAMView } from './components/StaffIAMView';

const MainContent: React.FC = () => {
  const { activeView, currentUser, canManageIAM } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0">
          {activeView === 'dashboard' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Executive Financial Dashboard" />
            ) : (
              <FinanceDashboard />
            ))}

          {activeView === 'subscriptions_kanban' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Subscriptions Kanban Board" />
            ) : (
              <KanbanBoard />
            ))}

          {activeView === 'subscriptions_list' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Subscriptions Table Matrix" />
            ) : (
              <SubscriptionList />
            ))}

          {activeView === 'catalog' && <ProductCatalog />}

          {activeView === 'quotations' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Quotation Template Builder" />
            ) : (
              <QuotationManager />
            ))}

          {activeView === 'billing_run' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Bulk Billing Engine" />
            ) : (
              <BillingEngineView />
            ))}

          {activeView === 'invoices' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Invoices Ledger" />
            ) : (
              <InvoicesView />
            ))}

          {activeView === 'discounts' &&
            (currentUser.role === 'CUSTOMER' ? (
              <AccessRestricted requiredRole="Administrator / Staff / Finance Lead" featureName="Discount Rules Engine" />
            ) : (
              <DiscountRulesView />
            ))}

          {activeView === 'staff_iam' &&
            (!canManageIAM ? (
              <AccessRestricted requiredRole="Administrator" featureName="Staff IAM & Account Provisioning" />
            ) : (
              <StaffIAMView />
            ))}

          {activeView === 'customer_portal' && <CustomerPortal />}
        </main>
      </div>

      <ToastContainer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
