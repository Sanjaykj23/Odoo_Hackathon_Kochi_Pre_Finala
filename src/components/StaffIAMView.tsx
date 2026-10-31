import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Users, UserPlus, ShieldCheck, Check, AlertCircle, X, Lock } from 'lucide-react';

export const StaffIAMView: React.FC = () => {
  const { users, addUser } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [companyName, setCompanyName] = useState('Brightloop Software Pvt Ltd');

  // Password validation rules
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (!isPasswordValid) {
      alert('Password does not meet required security criteria!');
      return;
    }

    const success = await addUser({
      name,
      email,
      role,
      password,
      companyName
    });

    if (success) {
      setName('');
      setEmail('');
      setPassword('');
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Staff Accounts & IAM Access
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Manage administrative personnel, enforce role-based access policies (RBAC), and manage organizational seats.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(98,84,232,0.25)] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Member</span>
        </button>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
              <th className="py-3.5 px-5">Member Name</th>
              <th className="py-3.5 px-5">Email Address</th>
              <th className="py-3.5 px-5">Assigned System Role</th>
              <th className="py-3.5 px-5">Organization</th>
              <th className="py-3.5 px-5">Tax Profile / GSTIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E8EE]/70">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F0EDFA]/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-[#252735]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#F0EDFA] text-[#6254E8] font-bold text-xs flex items-center justify-center">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-[#697386] font-mono">{u.email}</td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                      u.role === 'ADMIN'
                        ? 'bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]'
                        : u.role === 'FINANCE_LEAD'
                        ? 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]'
                        : u.role === 'STAFF'
                        ? 'bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]'
                        : 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-[#697386]">{u.companyName || 'Brightloop Software'}</td>
                <td className="py-3.5 px-5 font-mono text-[#9299A8]">{u.gstin || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-base font-bold text-[#252735]">
                Provision New Team Account
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sundaram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  System Role & Perspective
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-semibold outline-hidden focus:border-[#6254E8]"
                >
                  <option value="STAFF">Sales Rep / Internal Staff</option>
                  <option value="FINANCE_LEAD">Finance Lead Executive</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="CUSTOMER">External Customer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Password (Security Policy)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                />

                {/* Password Strength Checklist */}
                <div className="mt-2.5 p-3 bg-[#F0EDFA]/40 border border-[#E3DCF7] rounded-2xl space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#2E7D5D] font-semibold' : 'text-[#9299A8]'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-[#55C9A2]" /> : <span className="w-3.5 h-3.5">•</span>}
                    <span>More than 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#2E7D5D] font-semibold' : 'text-[#9299A8]'}`}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5 text-[#55C9A2]" /> : <span className="w-3.5 h-3.5">•</span>}
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[#2E7D5D] font-semibold' : 'text-[#9299A8]'}`}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5 text-[#55C9A2]" /> : <span className="w-3.5 h-3.5">•</span>}
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-[#2E7D5D] font-semibold' : 'text-[#9299A8]'}`}>
                    {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-[#55C9A2]" /> : <span className="w-3.5 h-3.5">•</span>}
                    <span>At least 1 special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPasswordValid}
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  Create Member Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
