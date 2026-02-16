'use client';

import { useState } from 'react';
import { Shield, Lock, Users, ShieldAlert, Clock, Mail, Eye } from 'lucide-react';

interface Referral {
  id: string;
  ip_address: string;
  referred_at: string;
  blocked_at: string | null;
  blocked_until: string | null;
  attempts_after_referral: number;
  last_attempt_at: string | null;
  reason: string | null;
  created_at: string;
}

interface Stats {
  totalReferrals: number;
  activeBlocks: number;
  pendingReferrals: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Contraseña incorrecta');
        return;
      }

      const data = await res.json();
      setReferrals(data.referrals);
      setStats(data.stats);
      setAuthenticated(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  function getStatus(referral: Referral): { label: string; color: string } {
    if (referral.blocked_until && new Date(referral.blocked_until) > new Date()) {
      return { label: 'Bloqueada', color: 'bg-red-500/20 text-red-400' };
    }
    if (referral.blocked_until && new Date(referral.blocked_until) <= new Date()) {
      return { label: 'Bloqueo expirado', color: 'bg-zinc-500/20 text-zinc-400' };
    }
    return { label: 'Derivada (activa)', color: 'bg-amber-500/20 text-amber-400' };
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Panel Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">Ego-Core - Gestión de derivaciones</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-900 font-semibold py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Panel de Administración</h1>
            <p className="text-zinc-500 text-sm">Gestión de derivaciones y bloqueos</p>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-zinc-500 hover:text-zinc-300 text-sm"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-500" />
                </div>
                <span className="text-zinc-400 text-sm">Total derivaciones</span>
              </div>
              <p className="text-3xl font-bold text-zinc-100">{stats.totalReferrals}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-zinc-400 text-sm">Bloqueos activos</span>
              </div>
              <p className="text-3xl font-bold text-zinc-100">{stats.activeBlocks}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-zinc-400 text-sm">Pendientes (en gracia)</span>
              </div>
              <p className="text-3xl font-bold text-zinc-100">{stats.pendingReferrals}</p>
            </div>
          </div>
        )}

        {/* Referrals table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Derivaciones</h2>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No hay derivaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-3">IP</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Derivada</th>
                    <th className="px-6 py-3">Intentos</th>
                    <th className="px-6 py-3">Bloqueo hasta</th>
                    <th className="px-6 py-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {referrals.map((referral) => {
                    const status = getStatus(referral);
                    return (
                      <tr key={referral.id} className="hover:bg-zinc-800/50">
                        <td className="px-6 py-4 font-mono text-sm text-zinc-300">
                          {referral.ip_address}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {formatDate(referral.referred_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {referral.attempts_after_referral}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {referral.blocked_until ? formatDate(referral.blocked_until) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 max-w-xs truncate">
                          {referral.reason || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-600 text-sm">
          <Mail className="w-4 h-4" />
          <span>Las derivaciones envían email automático a lalifreyre.lf@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
