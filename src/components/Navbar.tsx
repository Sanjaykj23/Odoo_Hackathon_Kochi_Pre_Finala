import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from '../router/Router';
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
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown
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
    logout,
    switchRole
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleDropdown(false);
    if (newRole === 'ADMIN') navigate('/admin/dashboard');
    else if (newRole === 'FINANCE_LEAD') navigate('/finance/dashboard');
    else if (newRole === 'STAFF') navigate('/staff/kanban');
    else navigate('/customer/portal');
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Administrator',
          badgeClass: 'bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#6254E8]" />
        };
      case 'FINANCE_LEAD':
        return {
          label: 'Finance Lead',
          badgeClass: 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]',
          icon: <PieChart className="w-3.5 h-3.5 text-[#55C9A2]" />
        };
      case 'STAFF':
        return {
          label: 'Sales Staff',
          badgeClass: 'bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]',
          icon: <UserCheck className="w-3.5 h-3.5 text-[#87BCEB]" />
        };
      default:
        return {
          label: 'Customer',
          badgeClass: 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]',
          icon: <Building2 className="w-3.5 h-3.5 text-[#F3C77B]" />
        };
    }
  };

  const roleTheme = getRoleTheme(authenticatedUser.role);

  const getHomeRoute = () => {
    if (authenticatedUser.role === 'ADMIN') return '/admin/dashboard';
    if (authenticatedUser.role === 'FINANCE_LEAD') return '/finance/dashboard';
    if (authenticatedUser.role === 'STAFF') return '/staff/kanban';
    return '/customer/portal';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E3E8EE] shadow-[0_2px_12px_rgba(41,42,58,0.02)] transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Organization */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to={getHomeRoute()} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6254E8] via-[#7A8CE8] to-[#87BCEB] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(98,84,232,0.25)] transition-transform group-hover:scale-105">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#252735]">
                  Brightloop <span className="text-[#6254E8]">Software</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
                  v2.4
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#697386]">
                <span>Bengaluru Enterprise HQ</span>
                <span className="text-[#DCE5ED]">·</span>
                <span className="font-mono text-[10px]">GST 18% Active</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Soft Pastel Style) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#9299A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts, invoices, customer GSTIN, or products..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F0EDFA]/40 hover:bg-[#F0EDFA]/60 focus:bg-white border border-[#E3E8EE] focus:border-[#7A8CE8] focus:ring-2 focus:ring-[#6254E8]/10 text-[#252735] placeholder-[#9299A8] transition-all outline-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        {/* Controls: Role Switcher, Notifications, Theme, User Avatar, Quick Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Perspective Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${roleTheme.badgeClass} hover:opacity-95 transition-all shadow-2xs`}
              title="Switch user perspective"
            >
              {roleTheme.icon}
              <span className="hidden sm:inline">{roleTheme.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#E3E8EE] shadow-[0_12px_32px_rgba(41,42,58,0.08)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#9299A8] uppercase tracking-wider border-b border-[#E3E8EE]">
                  Perspective Selector
                </div>
                {(['ADMIN', 'FINANCE_LEAD', 'STAFF', 'CUSTOMER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-[#F0EDFA]/50 transition-colors ${
                      authenticatedUser.role === r ? 'text-[#6254E8] font-bold bg-[#E9E6FF]/30' : 'text-[#252735]'
                    }`}
                  >
                    <span>
                      {r === 'ADMIN' && 'Administrator'}
                      {r === 'FINANCE_LEAD' && 'Finance Lead'}
                      {r === 'STAFF' && 'Sales Staff'}
                      {r === 'CUSTOMER' && 'Customer Portal'}
                    </span>
                    {authenticatedUser.role === r && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6254E8]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl border border-[#E3E8EE] bg-white hover:bg-[#F0EDFA]/40 text-[#697386] hover:text-[#252735] transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#55C9A2] ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#E3E8EE] shadow-[0_12px_32px_rgba(41,42,58,0.08)] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]">
                  <span className="text-xs font-bold text-[#252735]">System Activity</span>
                  <span className="text-[10px] font-semibold text-[#55C9A2] bg-[#E1F3EB] px-1.5 py-0.5 rounded">All Synced</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#E1F3EB]/40 border border-[#CEEBDD] text-[11px]">
                    <div className="font-semibold text-[#2E7D5D]">Invoice Run Ready</div>
                    <div className="text-[#697386]">Next automated cadence batch in queue.</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#E5F0FA]/40 border border-[#D5E6F5] text-[11px]">
                    <div className="font-semibold text-[#2C6EA6]">GST Ledger Validated</div>
                    <div className="text-[#697386]">B2B invoices aligned with 18% tax.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E3E8EE] bg-white hover:bg-[#F0EDFA]/40 text-[#697386] hover:text-[#252735] transition-all"
            title={`Toggle Theme (Current: ${theme})`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#F3C77B]" />}
          </button>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#E3E8EE] bg-white/70 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6254E8] to-[#7A8CE8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {authenticatedUser.name ? authenticatedUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#252735] leading-tight">
                {authenticatedUser.name || 'User'}
              </span>
              <span className="text-[10px] text-[#9299A8] font-mono truncate max-w-[120px]">
                {authenticatedUser.email}
              </span>
            </div>
          </div>

          {/* Trigger Billing Day Button (Admin / Finance Lead) */}
          {(authenticatedUser.role === 'ADMIN' || authenticatedUser.role === 'FINANCE_LEAD') && (
            <button
              onClick={handleTriggerBilling}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(98,84,232,0.25)] transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-[#F3C77B]" />
              <span>Trigger Billing</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#FFE1D1] bg-[#FFF1E8]/60 hover:bg-[#FFF1E8] text-xs font-semibold text-[#B86221] transition-all"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5 text-[#E99B9B]" />
            <span className="hidden xl:inline">Log Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
