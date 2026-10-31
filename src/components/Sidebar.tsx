import React from 'react';
import { useApp, ActiveView } from '../context/AppContext';
import {
  Kanban,
  Table,
  Package,
  FileText,
  Zap,
  Receipt,
  Percent,
  Users,
  Building2,
  PieChart,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentUser, subscriptions, invoices } = useApp();

  const activeSubCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const overdueInvoiceCount = invoices.filter(
    (i) => i.status === 'CONFIRMED' && i.dueDate < new Date().toISOString().split('T')[0]
  ).length;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    allowedRoles?: ('ADMIN' | 'STAFF' | 'CUSTOMER' | 'FINANCE_LEAD')[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: <PieChart className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'subscriptions_kanban',
      label: 'Subscriptions Kanban',
      icon: <Kanban className="w-4 h-4" />,
      badge: `${subscriptions.length} active`,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'subscriptions_list',
      label: 'Subscriptions Table',
      icon: <Table className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'catalog',
      label: 'Products & Plans',
      icon: <Package className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'quotations',
      label: 'Quotation Offers',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'billing_run',
      label: 'Bulk Billing Engine',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'invoices',
      label: 'Invoices & Ledger',
      icon: <Receipt className="w-4 h-4" />,
      badge: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} overdue` : undefined,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'discounts',
      label: 'Discount Rules',
      icon: <Percent className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'STAFF', 'FINANCE_LEAD']
    },
    {
      id: 'staff_iam',
      label: 'Staff Accounts & IAM',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['ADMIN']
    },
    {
      id: 'customer_portal',
      label: 'Customer Self-Service',
      icon: <Building2 className="w-4 h-4" />,
      allowedRoles: ['ADMIN', 'CUSTOMER']
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workspace Navigation</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              // Role check
              if (
                item.allowedRoles &&
                !item.allowedRoles.includes(currentUser.role)
              ) {
                return null;
              }

              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span>Active Subscriptions:</span>
          <span className="font-semibold text-emerald-400 font-mono">{activeSubCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax Engine:</span>
          <span className="font-medium text-slate-300">GST 18% (IN)</span>
        </div>
      </div>
    </aside>
  );
};
