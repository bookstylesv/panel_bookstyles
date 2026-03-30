import { useEffect, useState, useCallback } from 'react';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { colors, shadow } from '@/styles/colors';
import { barberSvc, type BarberHealthData } from '@/services/barber.service';

export default function BarberHealthPage() {
  const [health,   setHealth]   = useState<BarberHealthData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastPing, setLastPing] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await barberSvc.getHealth();
      setHealth(data); setLastPing(new Date());
    } catch {
      setHealth({ status: 'error', db_latency_ms: 0, timestamp: new Date().toISOString() });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const isOk = health?.status === 'ok';

  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity size={22} color="#059669" />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>BarberPro — Health</h1>
            <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>
              {lastPing ? `Última verificación: ${lastPing.toLocaleTimeString('es-SV')}` : 'Verificando...'}
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'none', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, color: colors.textSecondary, cursor: 'pointer' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ height: 100, background: '#f0f0f0', borderRadius: 14 }} />
      ) : (
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            {isOk
              ? <CheckCircle size={36} color="#10b981" />
              : <XCircle   size={36} color="#ef4444" />}
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isOk ? '#065f46' : '#dc2626' }}>
                {isOk ? 'Sistema operativo' : 'Sistema con errores'}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
                Estado: <strong>{health?.status}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fafafa', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latencia BD</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: colors.textPrimary }}>{health?.db_latency_ms ?? '—'} <span style={{ fontSize: 12, fontWeight: 400, color: colors.textMuted }}>ms</span></p>
            </div>
            <div style={{ background: '#fafafa', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>{health?.timestamp ? new Date(health.timestamp).toLocaleString('es-SV') : '—'}</p>
            </div>
          </div>

          {!isOk && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#fef2f2', borderRadius: 10, fontSize: 13, color: '#dc2626' }}>
              El servicio BarberPro no responde correctamente. Verifica que la <code>BARBER_SUPERADMIN_API_KEY</code> esté configurada en los env vars de BarberPro y que los endpoints <code>/api/superadmin/health</code> existan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
