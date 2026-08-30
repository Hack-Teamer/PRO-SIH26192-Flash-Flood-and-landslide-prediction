import React, { useState } from 'react';
import { X, Lock, Shield, User } from 'lucide-react';
import api from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('ndrf_admin');
  const [password, setPassword] = useState('ndrf2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { username, password });
      onLoginSuccess(resp.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-command-card border border-command-border rounded-lg p-6 font-mono relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-command-muted hover:text-command-text"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-command-bg p-2.5 rounded border border-command-border">
            <Shield className="w-6 h-6 text-signal-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-command-text tracking-wide">
              DUTY OFFICER AUTHENTICATION
            </h2>
            <p className="text-xs text-command-muted">NDRF 15th Bn / SDMA Command Console</p>
          </div>
        </div>

        {error && (
          <div className="bg-risk-red/20 border border-risk-red text-risk-red p-2.5 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-command-muted block mb-1">Select Preserved Credentials:</label>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <button
                type="button"
                onClick={() => { setUsername('ndrf_admin'); setPassword('ndrf2026'); }}
                className={`p-2 rounded border text-left ${username === 'ndrf_admin' ? 'border-signal-cyan bg-command-bg text-signal-cyan font-bold' : 'border-command-border text-command-muted'}`}
              >
                NDRF HQ (SUPER)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('sdma_officer'); setPassword('sdma2026'); }}
                className={`p-2 rounded border text-left ${username === 'sdma_officer' ? 'border-signal-cyan bg-command-bg text-signal-cyan font-bold' : 'border-command-border text-command-muted'}`}
              >
                District Magistrate
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-command-muted block mb-1">Username:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-2.5 top-2.5 text-command-muted" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-command-bg border border-command-border rounded pl-8 pr-3 py-2 text-xs text-command-text focus:outline-none focus:border-signal-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-command-muted block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-command-muted" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-command-bg border border-command-border rounded pl-8 pr-3 py-2 text-xs text-command-text focus:outline-none focus:border-signal-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal-cyan text-command-bg font-bold py-2.5 rounded text-xs hover:bg-cyan-300 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate Duty Session'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-command-border text-[10px] text-command-muted text-center">
          Protected System • Encrypted JWT RBAC • Ministry of Home Affairs
        </div>
      </div>
    </div>
  );
}
