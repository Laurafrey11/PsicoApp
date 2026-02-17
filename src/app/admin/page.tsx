'use client';

import { useState } from 'react';
import { Shield, Lock, Users, ShieldAlert, Clock, Mail, Eye, CreditCard, CheckCircle, BarChart3, Zap, DollarSign } from 'lucide-react';

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

interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_tokens: number;
  amount_usd: number;
  status: string;
  due_date: string;
  sent_at: string | null;
  paid_at: string | null;
}

interface TokenMetric {
  userId: string;
  email: string;
  totalTokens: number;
  messageCount: number;
  estimatedCost: number;
}

interface Stats {
  totalReferrals: number;
  activeBlocks: number;
  pendingReferrals: number;
  unpaidInvoices: number;
  totalTokens30d: number;
  totalMessages30d: number;
  totalCost30d: number;
  activeUsers: number;
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

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetric[]>([]);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'billing' | 'referrals'>('metrics');

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
      setInvoices(data.invoices || []);
      setTokenMetrics(data.tokenMetrics || []);
      setStats(data.stats);
      setAuthenticated(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(invoiceId: string) {
    setMarkingPaid(invoiceId);
    try {
      const res = await fetch('/api/admin/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, invoiceId }),
      });

      if (res.ok) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, status: 'paid', paid_at: new Date().toISOString() }
              : inv
          )
        );
        if (stats) {
          setStats({ ...stats, unpaidInvoices: Math.max(0, stats.unpaidInvoices - 1) });
        }
      }
    } catch {
      console.error('Error marking as paid');
    } finally {
      setMarkingPaid(null);
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

  const invoiceStatusColors: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400',
    sent: 'bg-cyan-500/20 text-cyan-400',
    pending: 'bg-zinc-500/20 text-zinc-400',
    overdue: 'bg-red-500/20 text-red-400',
  };

  const invoiceStatusLabels: Record<string, string> = {
    paid: 'Pagada',
    sent: 'Pendiente',
    pending: 'Pendiente',
    overdue: 'Vencida',
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Panel Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">Ego-Core - Gestión</p>
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
            <p className="text-zinc-500 text-sm">Gestión de derivaciones y facturación</p>
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
          <div className="space-y-4 mb-8">
            {/* Token metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-500" />
                  </div>
                  <span className="text-zinc-400 text-sm">Tokens (30d)</span>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{stats.totalTokens30d.toLocaleString('es-AR')}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-teal-500" />
                  </div>
                  <span className="text-zinc-400 text-sm">Costo (30d)</span>
                </div>
                <p className="text-2xl font-bold gradient-text">USD ${stats.totalCost30d.toFixed(2)}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-zinc-400 text-sm">Usuarios activos</span>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{stats.activeUsers}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-zinc-400 text-sm">Facturas impagas</span>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{stats.unpaidInvoices}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'billing'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Facturación
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'referrals'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 inline mr-2" />
            Derivaciones
          </button>
        </div>

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">Consumo de tokens por usuario (últimos 30 días)</h2>
            </div>

            {tokenMetrics.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No hay consumo registrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3 text-right">Mensajes</th>
                      <th className="px-6 py-3 text-right">Tokens</th>
                      <th className="px-6 py-3 text-right">Costo estimado</th>
                      <th className="px-6 py-3">Uso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {tokenMetrics.map((metric) => {
                      const maxTokens = tokenMetrics[0]?.totalTokens || 1;
                      const percentage = Math.round((metric.totalTokens / maxTokens) * 100);
                      return (
                        <tr key={metric.userId} className="hover:bg-zinc-800/50">
                          <td className="px-6 py-4 text-sm text-zinc-300">{metric.email}</td>
                          <td className="px-6 py-4 text-sm text-zinc-400 text-right">{metric.messageCount}</td>
                          <td className="px-6 py-4 text-sm text-zinc-200 text-right font-mono">
                            {metric.totalTokens.toLocaleString('es-AR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold gradient-text">
                            ${metric.estimatedCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 w-40">
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">Facturas</h2>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No hay facturas emitidas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-3">N° Factura</th>
                      <th className="px-6 py-3">Período</th>
                      <th className="px-6 py-3">Tokens</th>
                      <th className="px-6 py-3">Monto</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Vencimiento</th>
                      <th className="px-6 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-zinc-800/50">
                        <td className="px-6 py-4 font-mono text-sm text-zinc-300">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {formatShortDate(invoice.period_start)} - {formatShortDate(invoice.period_end)}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {invoice.total_tokens.toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-200 font-semibold">
                          USD ${invoice.amount_usd.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoiceStatusColors[invoice.status] || ''}`}>
                            {invoiceStatusLabels[invoice.status] || invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {formatShortDate(invoice.due_date)}
                        </td>
                        <td className="px-6 py-4">
                          {invoice.status !== 'paid' ? (
                            <button
                              onClick={() => handleMarkPaid(invoice.id)}
                              disabled={markingPaid === invoice.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium disabled:opacity-50 transition-colors"
                            >
                              {markingPaid === invoice.id ? (
                                'Procesando...'
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Marcar pagada
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-green-500/50 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {invoice.paid_at ? formatShortDate(invoice.paid_at) : 'Pagada'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
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
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-600 text-sm">
          <Mail className="w-4 h-4" />
          <span>Las derivaciones envían email automático a lalifreyre.lf@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
