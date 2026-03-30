import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Scissors } from 'lucide-react';
import { colors, shadow, radius } from '@/styles/colors';
import { barberSvc, type BarberTenantDetalle, type BarberUpdateTenantDTO, type BarberPlan, type BarberStatus } from '@/services/barber.service';

const PLANS:    BarberPlan[]   = ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'];
const STATUSES: BarberStatus[] = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  TRIAL:     { bg: 'rgba(245,158,11,0.1)',  text: '#d97706' },
  SUSPENDED: { bg: 'rgba(239,68,68,0.1)',   text: '#dc2626' },
  CANCELLED: { bg: 'rgba(156,163,175,0.1)', text: '#6b7280' },
};

export default function BarberTenantDetallePage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [tenant,   setTenant]  = useState<BarberTenantDetalle | null>(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState<string | null>(null);
  const [edit,     setEdit]    = useState<BarberUpdateTenantDTO>({});
  const [msg,      setMsg]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    barberSvc.getTenant(Number(id))
      .then(data => { setTenant(data); setEdit({ plan: data.plan, status: data.status, maxBarbers: data.maxBarbers }); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true); setMsg(null);
    try {
      const updated = await barberSvc.updateTenant(Number(id), edit);
      setTenant(updated);
      setMsg('Guardado correctamente');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleQuickAction = async (action: 'suspend' | 'activate') => {
    if (!id || !tenant) return;
    if (!window.confirm(`¿Confirmar ${action === 'suspend' ? 'suspender' : 'activar'} esta barbería?`)) return;
    setSaving(true);
    try {
      if (action === 'suspend') await barberSvc.suspendTenant(Number(id));
      else await barberSvc.activateTenant(Number(id));
      const updated = await barberSvc.getTenant(Number(id));
      setTenant(updated); setEdit({ plan: updated.plan, status: updated.status, maxBarbers: updated.maxBarbers });
      setMsg('Estado actualizado');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 32, color: colors.textMuted, fontFamily: 'Inter, sans-serif' }}>Cargando...</div>;
  if (error)   return <div style={{ padding: 32, color: '#dc2626', fontFamily: 'Inter, sans-serif' }}>{error}</div>;
  if (!tenant) return null;

  const statusStyle = STATUS_COLORS[tenant.status] ?? STATUS_COLORS.TRIAL;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: `1px solid ${colors.border}`,
    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', background: colors.inputBg,
  };

  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <button onClick={() => navigate('/barber/tenants')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={15} /> Volver a barberías
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, background: '#05966918', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={22} color="#059669" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>{tenant.name}</h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: statusStyle.text, background: statusStyle.bg, borderRadius: 6, padding: '3px 8px' }}>
              {tenant.status}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>slug: <code>{tenant.slug}</code></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tenant.status !== 'SUSPENDED' && (
            <button onClick={() => handleQuickAction('suspend')} disabled={saving}
              style={{ padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Suspender
            </button>
          )}
          {(tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') && (
            <button onClick={() => handleQuickAction('activate')} disabled={saving}
              style={{ padding: '8px 14px', background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Activar
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: msg.includes('Error') ? '#fef2f2' : '#d1fae5', borderRadius: 10, fontSize: 13, color: msg.includes('Error') ? '#dc2626' : '#065f46', marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Info básica */}
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Información</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Email',    value: tenant.email   ?? '—' },
              { label: 'Teléfono', value: tenant.phone   ?? '—' },
              { label: 'Ciudad',   value: tenant.city    ?? '—' },
              { label: 'País',     value: tenant.country },
              { label: 'Creado',   value: new Date(tenant.createdAt).toLocaleDateString('es-SV') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: `1px solid ${colors.borderLight}` }}>
                <span style={{ fontSize: 13, color: colors.textMuted }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conteos */}
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Estadísticas</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Usuarios',    value: tenant._count.users,        icon: Users    },
              { label: 'Barberos',    value: tenant._count.barbers,      icon: Scissors },
              { label: 'Citas total', value: tenant._count.appointments, icon: Building2 },
              { label: 'Max barberos', value: tenant.maxBarbers,          icon: Scissors },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: '#fafafa', borderRadius: 10, padding: '14px' }}>
                <Icon size={14} color={colors.textMuted} />
                <p style={{ margin: '6px 0 2px', fontSize: 11, color: colors.textMuted }}>{label}</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor plan/estado */}
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24, gridColumn: '1 / -1' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Gestión de suscripción</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</label>
              <select value={edit.plan ?? ''} onChange={e => setEdit(p => ({ ...p, plan: e.target.value as BarberPlan }))} style={inputStyle}>
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</label>
              <select value={edit.status ?? ''} onChange={e => setEdit(p => ({ ...p, status: e.target.value as BarberStatus }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pagado hasta</label>
              <input type="date" value={edit.paidUntil?.split('T')[0] ?? ''} onChange={e => setEdit(p => ({ ...p, paidUntil: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Máx. barberos</label>
              <input type="number" min={1} value={edit.maxBarbers ?? ''} onChange={e => setEdit(p => ({ ...p, maxBarbers: Number(e.target.value) }))} style={inputStyle} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 22px', background: saving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: radius.md, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
