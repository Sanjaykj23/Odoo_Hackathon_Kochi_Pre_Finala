import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Check, X, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, addToast, users } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      onClose();
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    addToast(`Password recovery link & reset token sent to ${email || 'registered email'}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white/95 border border-[#E3E8EE] rounded-3xl max-w-sm w-full p-6 shadow-[0_12px_36px_rgba(41,42,58,0.12)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9E6FF] flex items-center justify-center text-[#6254E8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#252735] font-display">
              {mode === 'LOGIN' ? 'Brightloop IAM Sign In' : 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9299A8] hover:text-[#252735] p-1 rounded-lg hover:bg-[#EAF3F8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#252735] mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                <input
                  type="email"
                  required
                  placeholder="admin@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] font-mono focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-[#252735]">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('FORGOT')}
                  className="text-[#6254E8] hover:underline text-[11px] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] font-mono focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl card-lavender border border-[#E3E8EE] text-[11px] text-[#697386]">
              <span className="font-semibold text-[#252735]">Quick Login Presets:</span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {users.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => {
                      setEmail(u.email);
                      setPassword('Brightloop@2026!');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white border border-[#E3E8EE] text-[#252735] hover:border-[#6254E8] font-mono text-[10px] shadow-2xs transition-all cursor-pointer"
                  >
                    {u.name.split(' ')[0]} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white font-semibold text-xs shadow-md shadow-[#6254E8]/20 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-3 text-xs">
            {resetSent ? (
              <div className="p-4 card-mint border border-[#55C9A2]/40 text-[#252735] rounded-2xl space-y-2 text-center">
                <KeyRound className="w-6 h-6 text-[#55C9A2] mx-auto" />
                <div className="font-bold text-[#252735]">Password Reset Link Sent!</div>
                <div className="text-[11px] text-[#697386]">
                  A recovery token link <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E3E8EE]">https://brightloop.io/reset?token=tk_9874839</code> has been generated.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode('LOGIN');
                  }}
                  className="mt-2 text-xs font-semibold text-[#6254E8] underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-[#697386] text-[11px] leading-relaxed">
                  Enter your registered email address to receive a password reset link and token.
                </p>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@brightloop.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] font-mono focus:ring-2 focus:ring-[#6254E8] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="w-1/2 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#EAF3F8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white font-semibold cursor-pointer shadow-md shadow-[#6254E8]/20"
                  >
                    Send Token
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
