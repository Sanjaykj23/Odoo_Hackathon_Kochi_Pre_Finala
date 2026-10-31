import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

interface AccessRestrictedProps {
  requiredRole?: string;
  featureName?: string;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredRole = 'Administrator',
  featureName = 'this system module'
}) => {
  const { currentUser, setActiveView } = useApp();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto my-12 shadow-xl text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono">
          403 ACCESS RESTRICTED
        </span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2 font-display">
          Insufficient Permissions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your current active role (<strong className="text-slate-900 dark:text-white font-mono">{currentUser.role}</strong>) does not have access to {featureName}.
        </p>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
        Requires <strong>{requiredRole}</strong> elevated security clearance. Use the top-bar role switcher to switch perspective if testing admin controls.
      </div>

      <button
        onClick={() => setActiveView(currentUser.role === 'CUSTOMER' ? 'customer_portal' : 'dashboard')}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Allowed Dashboard</span>
      </button>
    </div>
  );
};
