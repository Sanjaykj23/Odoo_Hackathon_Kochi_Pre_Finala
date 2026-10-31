/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Router, useLocation, useNavigate } from './router/Router';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { AccessRestricted } from './components/AccessRestricted';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Enterprise Components
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

const AuthenticatedLayout: React.FC = () => {
  const { authenticatedUser, canManageIAM } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = authenticatedUser.role;

  // Auto-redirect if on a generic route or wrong base
  useEffect(() => {
    if (pathname === '/admin' || pathname === '/dashboard') {
      navigate('/admin/dashboard');
    } else if (pathname === '/finance') {
      navigate('/finance/dashboard');
    } else if (pathname === '/staff') {
      navigate('/staff/subscriptions-list');
    } else if (pathname === '/customer') {
      navigate('/customer/portal');
    }
  }, [pathname, navigate]);

  const renderActiveRoute = () => {
    // 1. ADMIN ROUTES
    if (pathname.startsWith('/admin')) {
      if (role !== 'ADMIN') {
        return <AccessRestricted requiredRole="Administrator" featureName="Admin Console" />;
      }

      if (pathname === '/admin/dashboard') return <FinanceDashboard />;
      if (pathname === '/admin/catalog') return <ProductCatalog />;
      if (pathname === '/admin/discounts') return <DiscountRulesView />;
      if (pathname === '/admin/staff-iam') return <StaffIAMView />;
      if (pathname === '/admin/subscriptions-kanban') return <SubscriptionList />;
      if (pathname === '/admin/subscriptions-list') return <SubscriptionList />;
      if (pathname === '/admin/quotations') return <QuotationManager />;
      if (pathname === '/admin/billing-run') return <BillingEngineView />;
      if (pathname === '/admin/invoices') return <InvoicesView />;
      return <FinanceDashboard />;
    }

    // 2. FINANCE LEAD ROUTES
    if (pathname.startsWith('/finance')) {
      if (role !== 'FINANCE_LEAD' && role !== 'ADMIN') {
        return <AccessRestricted requiredRole="Finance Lead / Admin" featureName="Finance Portal" />;
      }

      if (pathname === '/finance/dashboard') return <FinanceDashboard />;
      if (pathname === '/finance/billing-run') return <BillingEngineView />;
      if (pathname === '/finance/invoices') return <InvoicesView />;
      if (pathname === '/finance/subscriptions-list') return <SubscriptionList />;
      return <FinanceDashboard />;
    }

    // 3. STAFF (SALES REP) ROUTES
    if (pathname.startsWith('/staff')) {
      if (role !== 'STAFF' && role !== 'ADMIN') {
        return <AccessRestricted requiredRole="Sales Staff / Admin" featureName="Sales Portal" />;
      }

      if (pathname === '/staff/kanban') return <SubscriptionList />;
      if (pathname === '/staff/subscriptions-list') return <SubscriptionList />;
      if (pathname === '/staff/quotations') return <QuotationManager />;
      if (pathname === '/staff/catalog') return <ProductCatalog />;
      if (pathname === '/staff/invoices') return <InvoicesView />;
      return <KanbanBoard />;
    }

    // 4. CUSTOMER PORTAL ROUTES
    if (pathname.startsWith('/customer')) {
      if (role !== 'CUSTOMER' && role !== 'ADMIN') {
        return <AccessRestricted requiredRole="Customer" featureName="Customer Self-Service Portal" />;
      }
      return <CustomerPortal />;
    }

    // Role-default fallback
    if (role === 'ADMIN') return <FinanceDashboard />;
    if (role === 'FINANCE_LEAD') return <FinanceDashboard />;
    if (role === 'STAFF') return <KanbanBoard />;
    return <CustomerPortal />;
  };

  return (
    <div className="min-h-screen bg-[#EAF3F8] text-[#252735] flex flex-col antialiased selection:bg-[#E9E6FF] selection:text-[#6254E8] relative overflow-x-hidden">
      {/* Ambient background pastel atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#E1F3EB]/40 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[350px] bg-[#F0EDFA]/50 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[400px] bg-[#E5F0FA]/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <div className="flex-1 flex max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
          <Sidebar />

          <main className="flex-1 min-w-0 transition-all duration-200">
            {renderActiveRoute()}
          </main>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, authenticatedUser } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Public Routes (Accessible without login)
  if (pathname === '/' || pathname === '') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  if (pathname === '/login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  if (pathname === '/register') {
    return (
      <>
        <RegisterPage />
        <ToastContainer />
      </>
    );
  }

  // Protected Routes: If not logged in, redirect directly to /login
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Authenticated Dashboard Layout
  return <AuthenticatedLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
