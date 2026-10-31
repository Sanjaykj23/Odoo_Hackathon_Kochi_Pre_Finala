import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../router/Router';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

interface AccessRestrictedProps {
  requiredRole?: string;
  featureName?: string;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredRole = 'Administrator',
  featureName = 'this system module'
}) => {
  const { authenticatedUser } = useApp();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (authenticatedUser.role === 'ADMIN') navigate('/admin/dashboard');
    else if (authenticatedUser.role === 'FINANCE_LEAD') navigate('/finance/dashboard');
    else if (authenticatedUser.role === 'STAFF') navigate('/staff/kanban');
    else navigate('/customer/portal');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E3E8EE] p-8 max-w-lg mx-auto my-12 shadow-[0_10px_30px_rgba(41,42,58,0.04)] text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#FFEBEB] border border-[#FFD5D5] flex items-center justify-center text-[#D34545] mx-auto shadow-xs">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFEBEB] text-[#D34545] border border-[#FFD5D5] font-mono">
          403 ACCESS RESTRICTED
        </span>
        <h2 className="text-xl font-bold text-[#252735] mt-2">
          Insufficient Permissions
        </h2>
        <p className="text-xs text-[#697386] mt-1 leading-relaxed">
          Your current active role (<strong className="text-[#252735] font-mono">{authenticatedUser.role}</strong>) does not have access to {featureName}.
        </p>
      </div>

      <div className="p-3.5 bg-[#F0EDFA]/40 border border-[#E3DCF7] rounded-2xl text-xs text-[#697386] leading-relaxed">
        Requires <strong>{requiredRole}</strong> clearance. Use the top navigation role switcher to toggle perspective.
      </div>

      <button
        onClick={handleReturn}
        className="px-5 py-2.5 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Authorized View</span>
      </button>
    </div>
  );
};
