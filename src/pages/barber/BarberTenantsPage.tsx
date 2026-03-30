import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, ChevronRight } from 'lucide-react';
import { colors, shadow, radius } from '@/styles/colors';
import { barberSvc, type BarberTenantListItem, type BarberCreateTenantDTO } from '@/services/barber.service';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  TRIAL:     { bg: 'rgba(245,158,11,0.1)',  text: '#d97706' },
  SUSPENDED: { bg: 'rgba(239,68,68,0.1)',   text: '#dc2626' },
  CANCELLED: { bg: 'rgba(156,163,175,0.1)', text: '#6b7280' },
};

const PLAN_COLORS: Record<string, string> = {
  TRIAL:      '#6b7280', BASIC: '#6366f1', PRO: '#0891b2', ENTERPRISE: '#7c3aed',
};

export default function BarberTenantsPage() {
  const navigate = useNavigate();
  const [items,    setItems]    = useState<BarberTenantListItem[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<BarberCreateTenantDTO>>({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const result = await barberSvc.getTenants(params);
      setItems(result.items);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) return;
    setCreating(true);
    try {
      const newTenant = await barberSvc.createTenant(form as BarberCreateTenantDTO);
      setItems(prev => [newTenant as unknown as BarberTenantListItem, ...prev]);
      setShowForm(false); setForm({});
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear');
    } finally { setCreating(false); }
  };

  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: '0 0 4px' }}>Barberías</h1>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>{total} registros en total</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} />
          Nueva barbería
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24, marginBottom: 24 }}>
          <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>Nueva barbería</p>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { field: 'name',  label: 'Nombre *',  type: 'text', placeholder: 'Mi Barbería' },
              { field: 'slug',  label: 'Slug *',    type: 'text', placeholder: 'mi-barberia' },
              { field: 'email', label: 'Email',     type: 'email', placeholder: 'contacto@...' },
              { field: 'phone', label: 'Teléfono',  type: 'text', placeholder: '6000-0000' },
              { field: 'city',  label: 'Ciudad',    type: 'text', placeholder: 'San Salvador' },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  value={(form as Record<string, string>)[field] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: colors.inputBg }} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={creating || !form.slug || !form.name}
                style={{ padding: '9px 20px', background: creating ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer' }}>
                {creating ? 'Creando...' : 'Crear barbería'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm({}); }}
                style={{ padding: '9px 16px', background: 'none', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, color: colors.textSecondary, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
        <input type="text" placeholder="Buscar barbería..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px 9px 36px', border: `1px solid ${colors.border}`, borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: colors.cardBg }} />
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Tabla */}
      <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--th-bg)' }}>
              {['Barbería', 'Slug', 'Plan', 'Estado', 'Vence', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: colors.textMuted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <td key={j} style={{ padding: '12px 16px' }}>
                      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 6, width: j === 1 ? '80%' : '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>No hay barberías registradas</td></tr>
            ) : items.map(item => {
              const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.TRIAL;
              const paidUntil   = item.paidUntil ? new Date(item.paidUntil).toLocaleDateString('es-SV') : item.trialEndsAt ? new Date(item.trialEndsAt).toLocaleDateString('es-SV') : '—';
              return (
                <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = colors.rowHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 30, height: 30, background: '#05966912', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={14} color="#059669" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: colors.textMuted }}>{item.email ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>{item.slug}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: PLAN_COLORS[item.plan] ?? '#6b7280', background: (PLAN_COLORS[item.plan] ?? '#6b7280') + '18', borderRadius: 6, padding: '3px 8px' }}>
                      {item.plan}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusStyle.text, background: statusStyle.bg, borderRadius: 6, padding: '3px 8px' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: colors.textMuted }}>{paidUntil}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => navigate(`/barber/tenants/${item.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: `1px solid ${colors.border}`, borderRadius: 7, padding: '5px 10px', fontSize: 12, color: colors.textSecondary, cursor: 'pointer' }}>
                      Ver
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
