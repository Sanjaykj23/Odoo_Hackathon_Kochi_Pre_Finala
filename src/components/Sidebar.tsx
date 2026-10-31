import React from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate } from '../router/Router';
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
  const { authenticatedUser, subscriptions, invoices } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeSubCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const overdueInvoiceCount = invoices.filter(
    (i) => i.status === 'CONFIRMED' && i.dueDate < new Date().toISOString().split('T')[0]
  ).length;

  // Role-specific navigation items with real URL routes
  const getNavItems = () => {
    const role = authenticatedUser.role;

    if (role === 'ADMIN') {
      return [
        {
          path: '/admin/dashboard',
          label: 'Executive Overview',
          icon: <PieChart className="w-4 h-4" />
        },
        {
          path: '/admin/staff-iam',
          label: 'Staff Accounts & IAM',
          icon: <Users className="w-4 h-4" />
        },
        {
          path: '/admin/catalog',
          label: 'Products & Plans',
          icon: <Package className="w-4 h-4" />
        },
        {
          path: '/admin/discounts',
          label: 'Discount Rules',
          icon: <Percent className="w-4 h-4" />
        },
        {
          path: '/admin/subscriptions-kanban',
          label: 'Subscriptions Kanban',
          icon: <Kanban className="w-4 h-4" />,
          badge: `${subscriptions.length} active`
        },
        {
          path: '/admin/subscriptions-list',
          label: 'Subscriptions Table',
          icon: <Table className="w-4 h-4" />
        },
        {
          path: '/admin/quotations',
          label: 'Quotation Offers',
          icon: <FileText className="w-4 h-4" />
        },
        {
          path: '/admin/billing-run',
          label: 'Bulk Billing Engine',
          icon: <Zap className="w-4 h-4 text-amber-500" />
        },
        {
          path: '/admin/invoices',
          label: 'Invoices & Ledger',
          icon: <Receipt className="w-4 h-4" />,
          badge: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} overdue` : undefined
        }
      ];
    }

    if (role === 'FINANCE_LEAD') {
      return [
        {
          path: '/finance/dashboard',
          label: 'Executive Overview',
          icon: <PieChart className="w-4 h-4" />
        },
        {
          path: '/finance/billing-run',
          label: 'Bulk Billing Engine',
          icon: <Zap className="w-4 h-4 text-amber-500" />
        },
        {
          path: '/finance/invoices',
          label: 'Invoices & Ledger',
          icon: <Receipt className="w-4 h-4" />,
          badge: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} overdue` : undefined
        },
        {
          path: '/finance/subscriptions-list',
          label: 'Subscriptions Table',
          icon: <Table className="w-4 h-4" />
        }
      ];
    }

    if (role === 'STAFF') {
      return [
        {
          path: '/staff/kanban',
          label: 'Subscriptions Kanban',
          icon: <Kanban className="w-4 h-4" />,
          badge: `${subscriptions.length} active`
        },
        {
          path: '/staff/subscriptions-list',
          label: 'Subscriptions Table',
          icon: <Table className="w-4 h-4" />
        },
        {
          path: '/staff/quotations',
          label: 'Quotation Offers',
          icon: <FileText className="w-4 h-4" />
        },
        {
          path: '/staff/catalog',
          label: 'Products & Plans',
          icon: <Package className="w-4 h-4" />
        },
        {
          path: '/staff/invoices',
          label: 'Invoices & Payments',
          icon: <Receipt className="w-4 h-4" />
        }
      ];
    }

    // CUSTOMER role
    return [
      {
        path: '/customer/portal',
        label: 'Customer Self-Service',
        icon: <Building2 className="w-4 h-4" />
      }
    ];
  };

  const visibleNavItems = getNavItems();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Workspace Navigation</span>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
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
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span>Active Subscriptions:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{activeSubCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Logged Role:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{authenticatedUser.role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Route:</span>
          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{pathname}</span>
        </div>
      </div>
    </aside>
  );
};
