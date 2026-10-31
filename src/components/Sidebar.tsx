import React, { useState } from 'react';
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
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { authenticatedUser, subscriptions, invoices } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

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
          path: '/admin/subscriptions-list',
          label: 'Subscriptions',
          icon: <Table className="w-4 h-4" />,
          badge: `${activeSubCount} active`,
          badgeVariant: 'mint'
        },
        {
          path: '/admin/subscriptions-kanban',
          label: 'Subscriptions Kanban',
          icon: <Kanban className="w-4 h-4" />
        },
        {
          path: '/admin/catalog',
          label: 'Products & Plans',
          icon: <Package className="w-4 h-4" />
        },
        {
          path: '/admin/quotations',
          label: 'Quotation Offers',
          icon: <FileText className="w-4 h-4" />
        },
        {
          path: '/admin/billing-run',
          label: 'Bulk Billing Engine',
          icon: <Zap className="w-4 h-4" />
        },
        {
          path: '/admin/invoices',
          label: 'Invoices & Ledger',
          icon: <Receipt className="w-4 h-4" />,
          badge: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} due` : undefined,
          badgeVariant: 'peach'
        },
        {
          path: '/admin/discounts',
          label: 'Discount Rules',
          icon: <Percent className="w-4 h-4" />
        },
        {
          path: '/admin/staff-iam',
          label: 'Staff Accounts & IAM',
          icon: <Users className="w-4 h-4" />
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
          path: '/finance/subscriptions-list',
          label: 'Subscriptions',
          icon: <Table className="w-4 h-4" />,
          badge: `${activeSubCount} active`,
          badgeVariant: 'mint'
        },
        {
          path: '/finance/billing-run',
          label: 'Bulk Billing Engine',
          icon: <Zap className="w-4 h-4" />
        },
        {
          path: '/finance/invoices',
          label: 'Invoices & Ledger',
          icon: <Receipt className="w-4 h-4" />,
          badge: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} due` : undefined,
          badgeVariant: 'peach'
        }
      ];
    }

    if (role === 'STAFF') {
      return [
        {
          path: '/staff/kanban',
          label: 'Subscriptions Kanban',
          icon: <Kanban className="w-4 h-4" />,
          badge: `${activeSubCount} active`,
          badgeVariant: 'mint'
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
    <aside
      className={`transition-all duration-300 ease-in-out shrink-0 sticky top-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-[#E3E8EE] rounded-3xl p-3.5 shadow-[0_10px_30px_rgba(41,42,58,0.03)] flex flex-col justify-between min-h-[calc(100vh-6.5rem)]">
        
        {/* Navigation Section */}
        <div className="space-y-4">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#E3E8EE]/60">
            {!isCollapsed && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#9299A8] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-[#6254E8]" />
                <span>Workspace Menu</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]/60 transition-all mx-auto"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#6254E8] text-white font-semibold shadow-[0_4px_16px_rgba(98,84,232,0.25)] translate-x-0.5'
                      : 'text-[#697386] hover:bg-[#F0EDFA]/50 hover:text-[#252735]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[#7A8CE8]'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeVariant === 'peach'
                          ? 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]'
                          : 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]'
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

        {/* Footer Workspace Status Card (Pastel Tint) */}
        {!isCollapsed ? (
          <div className="pt-3 border-t border-[#E3E8EE]/70 space-y-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#E1F3EB]/70 to-[#EAF3F8]/80 border border-[#CEEBDD] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#55C9A2] ring-2 ring-[#E1F3EB] animate-pulse" />
                  Live Sync
                </span>
                <span className="text-[10px] font-bold font-mono text-[#2E7D5D] bg-white/70 px-1.5 py-0.5 rounded border border-[#CEEBDD]">
                  {activeSubCount} Subs
                </span>
              </div>
              <div className="text-[10px] text-[#697386] leading-relaxed">
                ASC 606 & GST 18% ledger validated in real-time.
              </div>
            </div>

            <div className="flex items-center justify-between px-2 text-[10px] text-[#9299A8]">
              <span>Role: <strong className="text-[#6254E8]">{authenticatedUser.role}</strong></span>
              <span className="font-mono text-[9px] truncate max-w-[80px]">{pathname}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center pt-2 border-t border-[#E3E8EE]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55C9A2]" title="System Healthy" />
          </div>
        )}

      </div>
    </aside>
  );
};
