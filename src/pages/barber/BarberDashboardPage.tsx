import { useEffect, useState } from 'react';
import { Building2, CheckCircle, Clock, XCircle, Scissors } from 'lucide-react';
import { colors, shadow } from '@/styles/colors';
import { barberSvc, type BarberDashboardStats } from '@/services/barber.service';

export default function BarberDashboardPage() {
  const [stats,   setStats]   = useState<BarberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    barberSvc.getDashboard()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Total barberías',  value: stats.totalTenants,     icon: Building2,   color: '#6366f1' },
    { label: 'Activas',          value: stats.activeTenants,    icon: CheckCircle, color: '#10b981' },
    { label: 'En prueba',        value: stats.trialTenants,     icon: Clock,       color: '#f59e0b' },
    { label: 'Suspendidas',      value: stats.suspendedTenants, icon: XCircle,     color: '#ef4444' },
  ] : [];

  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 38, height: 38, background: '#05966918', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scissors size={18} color="#059669" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>BarberPro — Dashboard</h1>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>Resumen de barberías en el sistema</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
          Error de conexión: {error}. Verifica que BarberPro tenga los endpoints superadmin y la API key configurada.
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, minWidth: 180, height: 100, background: '#f0f0f0', borderRadius: 14 }} />
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            {kpis.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 180, background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, background: color + '18', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 500 }}>{label}</span>
                </div>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: colors.textPrimary }}>{value}</p>
              </div>
            ))}
          </div>

          {stats.byPlan && stats.byPlan.length > 0 && (
            <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: '20px 24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Distribución por plan</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.byPlan.map(({ plan, count }) => (
                  <div key={plan} style={{ background: '#fafafa', borderRadius: 10, padding: '12px 20px', minWidth: 100, textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{plan}</p>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: colors.textPrimary }}>{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
