import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from '../router/Router';
import {
  Zap,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Building2,
  PieChart,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    theme,
    toggleTheme,
    authenticatedUser,
    triggerBillingDayRun,
    logout
  } = useApp();
  const navigate = useNavigate();

  const handleTriggerBilling = () => {
    triggerBillingDayRun();
    if (authenticatedUser.role === 'ADMIN') {
      navigate('/admin/invoices');
    } else {
      navigate('/finance/invoices');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Administrator',
          bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        };
      case 'FINANCE_LEAD':
        return {
          label: 'Finance Lead',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        };
      case 'STAFF':
        return {
          label: 'Sales Staff',
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        };
      default:
        return {
          label: 'Customer',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        };
    }
  };

  const badgeInfo = getRoleBadge(authenticatedUser.role);

  const getHomeRoute = () => {
    if (authenticatedUser.role === 'ADMIN') return '/admin/dashboard';
    if (authenticatedUser.role === 'FINANCE_LEAD') return '/finance/dashboard';
    if (authenticatedUser.role === 'STAFF') return '/staff/kanban';
    return '/customer/portal';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <Link to={getHomeRoute()} className="flex items-center gap-3 shrink-0">
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
        </Link>

        {/* Zone 2: Authenticated User Profile & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Logged-in User Profile Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[11px]">
              {authenticatedUser.name ? authenticatedUser.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {authenticatedUser.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                {authenticatedUser.email}
              </span>
            </div>
            <div className={`ml-1 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeInfo.bg}`}>
              {badgeInfo.icon}
              <span>{badgeInfo.label}</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors shadow-xs"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

        {/* Zone 3: Primary Action (Admin & Finance Lead Only) */}
        {(authenticatedUser.role === 'ADMIN' || authenticatedUser.role === 'FINANCE_LEAD') && (
          <div className="shrink-0 hidden lg:block">
            <button
              onClick={handleTriggerBilling}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Trigger Billing Day</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
