import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Check, X, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, addToast } = useApp();

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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {mode === 'LOGIN' ? 'Brightloop IAM Sign In' : 'Reset Password'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('FORGOT')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Login Presets:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {users.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => {
                      setEmail(u.email);
                      setPassword('Brightloop@2026!');
                    }}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-500 font-mono"
                  >
                    {u.name.split(' ')[0]} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-3 text-xs">
            {resetSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-xl space-y-2 text-center">
                <KeyRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="font-bold">Password Reset Link Sent!</div>
                <div className="text-[11px]">
                  A recovery token link <code className="font-mono bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">https://brightloop.io/reset?token=tk_9874839</code> has been generated.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode('LOGIN');
                  }}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-[11px]">
                  Enter your registered email address to receive a password reset link and token.
                </p>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@brightloop.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="w-1/2 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
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
