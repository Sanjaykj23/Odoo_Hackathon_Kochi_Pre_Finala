import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Zap,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Building2,
  PieChart,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Home
} from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    switchRole,
    triggerBillingDayRun,
    setActiveView,
    logout,
    setScreenMode
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'ADMIN',
      label: 'Administrator',
      icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
      desc: 'Master catalog, tax rules, staff IAM'
    },
    {
      role: 'STAFF',
      label: 'Sales Rep / Internal Staff',
      icon: <UserCheck className="w-4 h-4 text-blue-500" />,
      desc: 'Quotations, subscriptions Kanban, payment log'
    },
    {
      role: 'FINANCE_LEAD',
      label: 'Finance Lead Executive',
      icon: <PieChart className="w-4 h-4 text-emerald-500" />,
      desc: 'MRR/ARR revenue reports, overdue aging'
    },
    {
      role: 'CUSTOMER',
      label: 'Customer Self-Service Portal',
      icon: <Building2 className="w-4 h-4 text-amber-500" />,
      desc: 'View personal plans, invoices & GST receipts'
    }
  ];

  const handleTriggerBilling = () => {
    triggerBillingDayRun();
    setActiveView('invoices');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            B
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Brightloop <span className="text-indigo-600 dark:text-indigo-400">Software</span>
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Bengaluru HQ</span>
              <span aria-hidden="true">·</span>
              <span>GST 18% Compliant</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Controls & Fast Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setScreenMode('LANDING')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Go to Company Landing Page"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Fast Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              title="Switch user perspective role"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Perspective / Persona
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                      currentUser.role === r.role
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">{r.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Account & Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Zone 3: Primary Action */}
        <div className="shrink-0 hidden lg:block">
          <button
            onClick={handleTriggerBilling}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Trigger Billing Day</span>
          </button>
        </div>
      </div>
    </header>
  );
};
