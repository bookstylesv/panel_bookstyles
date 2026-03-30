/**
 * DteClienteDetallePage.tsx — Detalle de un tenant DTE.
 * Tabs: Info | Pagos | Usuarios | DTE correlativos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DteTenantDetalle, DtePlan, DteTenantEstado, DteUpdateTenantDTO, DtePagoDTO } from '@/services/dte.service';
import { dteSvc } from '@/services/dte.service';
import { colors, radius, shadow } from '@/styles/colors';
import { ArrowLeft, Building2, Users, CreditCard, FileText } from 'lucide-react';

type Tab = 'info' | 'pagos' | 'usuarios' | 'dte';

const TAB_LIST: { id: Tab; label: string }[] = [
  { id: 'info',     label: 'Información' },
  { id: 'pagos',    label: 'Pagos'       },
  { id: 'usuarios', label: 'Usuarios'    },
  { id: 'dte',      label: 'DTE'         },
];

const ESTADOS: DteTenantEstado[] = ['pruebas', 'activo', 'suspendido'];

const ESTADO_COLORS: Record<DteTenantEstado, { bg: string; text: string }> = {
  activo:     { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  pruebas:    { bg: 'rgba(245,158,11,0.1)',  text: '#d97706' },
  suspendido: { bg: 'rgba(239,68,68,0.1)',   text: '#dc2626' },
};

export default function DteClienteDetallePage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [tab,      setTab]     = useState<Tab>('info');
  const [tenant,   setTenant]  = useState<DteTenantDetalle | null>(null);
  const [planes,   setPlanes]  = useState<DtePlan[]>([]);
  const [usuarios, setUsuarios] = useState<unknown[]>([]);
  const [pagos,    setPagos]   = useState<unknown[]>([]);
  const [dteList,  setDteList] = useState<unknown[]>([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [msg,      setMsg]     = useState<string | null>(null);
  const [edit,     setEdit]    = useState<DteUpdateTenantDTO>({});

  // Pago form
  const [pagoForm, setPagoForm] = useState<DtePagoDTO>({ monto: 0 });
  const [pagoSaving, setPagoSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      dteSvc.getTenant(Number(id)),
      dteSvc.getPlanes(),
    ]).then(([t, pl]) => {
      setTenant(t);
      setPlanes(pl);
      setEdit({ nombre: t.nombre, slug: t.slug, email_contacto: t.email_contacto ?? '', telefono: t.telefono ?? '', plan_id: t.plan_id ?? undefined, estado: t.estado, notas: t.notas ?? '' });
    }).catch(err => setMsg(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !tenant) return;
    if (tab === 'usuarios' && usuarios.length === 0)
      dteSvc.getUsuarios(Number(id)).then(setUsuarios).catch(() => {});
    if (tab === 'pagos' && pagos.length === 0)
      dteSvc.getPagos(Number(id)).then(data => setPagos(data as unknown[])).catch(() => {});
    if (tab === 'dte' && dteList.length === 0)
      dteSvc.getDTE(Number(id)).then(setDteList).catch(() => {});
  }, [tab, id, tenant]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true); setMsg(null);
    try {
      const updated = await dteSvc.updateTenant(Number(id), edit);
      setTenant(updated);
      setMsg('Guardado correctamente');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handlePago = async () => {
    if (!id || pagoForm.monto <= 0) return;
    setPagoSaving(true);
    try {
      await dteSvc.registrarPago(Number(id), pagoForm);
      const updated = await dteSvc.getPagos(Number(id));
      setPagos(updated as unknown[]);
      setPagoForm({ monto: 0 });
      setMsg('Pago registrado');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally { setPagoSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: `1px solid ${colors.border}`,
    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', background: colors.inputBg, color: colors.textPrimary,
  };

  if (loading) return <div style={{ padding: 32, color: colors.textMuted, fontFamily: 'Inter, sans-serif' }}>Cargando...</div>;
  if (!tenant) return <div style={{ padding: 32, color: '#dc2626', fontFamily: 'Inter, sans-serif' }}>{msg ?? 'No encontrado'}</div>;

  const estadoStyle = ESTADO_COLORS[tenant.estado];

  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <button onClick={() => navigate('/dte/clientes')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={15} /> Volver a clientes
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, background: '#0891b218', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={22} color="#0891b2" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>{tenant.nombre}</h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: estadoStyle.text, background: estadoStyle.bg, borderRadius: 6, padding: '3px 8px' }}>
              {tenant.estado}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>slug: <code>{tenant.slug}</code></p>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: msg.includes('Error') || msg.includes('error') ? '#fef2f2' : '#d1fae5', borderRadius: 10, fontSize: 13, color: msg.includes('Error') || msg.includes('error') ? '#dc2626' : '#065f46', marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${colors.border}`, paddingBottom: 0 }}>
        {TAB_LIST.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '9px 16px', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #0891b2' : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#0891b2' : colors.textSecondary, marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Datos */}
          <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Datos generales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Nombre',           field: 'nombre',         type: 'text' },
                { label: 'Slug',             field: 'slug',           type: 'text' },
                { label: 'Email contacto',   field: 'email_contacto', type: 'email' },
                { label: 'Teléfono',         field: 'telefono',       type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                  <input type={type} value={(edit as Record<string, string>)[field] ?? ''} onChange={e => setEdit(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</label>
                <select value={edit.plan_id ?? ''} onChange={e => setEdit(p => ({ ...p, plan_id: Number(e.target.value) || undefined }))} style={inputStyle}>
                  <option value="">Sin plan</option>
                  {planes.map(pl => <option key={pl.id} value={pl.id}>{pl.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</label>
                <select value={edit.estado ?? ''} onChange={e => setEdit(p => ({ ...p, estado: e.target.value as DteTenantEstado }))} style={inputStyle}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha pago</label>
                <input type="date" value={edit.fecha_pago?.split('T')[0] ?? ''} onChange={e => setEdit(p => ({ ...p, fecha_pago: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notas</label>
                <textarea value={edit.notas ?? ''} onChange={e => setEdit(p => ({ ...p, notas: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 20px', background: saving ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: radius.md, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* Stats rápidas */}
          <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Detalles de suscripción</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Plan',              value: tenant.plan_nombre ?? '—' },
                { label: 'Estado',            value: tenant.estado },
                { label: 'Fecha pago',        value: tenant.fecha_pago ? new Date(tenant.fecha_pago).toLocaleDateString('es-SV') : '—' },
                { label: 'Días para vencer',  value: tenant.dias_para_vencer != null ? `${tenant.dias_para_vencer} días` : '—' },
                { label: 'Fecha suspensión',  value: tenant.fecha_suspension ? new Date(tenant.fecha_suspension).toLocaleDateString('es-SV') : '—' },
                { label: 'Creado',            value: new Date(tenant.created_at).toLocaleDateString('es-SV') },
                { label: 'Actualizado',       value: new Date(tenant.updated_at).toLocaleDateString('es-SV') },
                { label: 'Max sucursales',    value: String(tenant.max_sucursales_override ?? tenant.plan_max_sucursales ?? '—') },
                { label: 'Max usuarios',      value: String(tenant.max_usuarios_override ?? tenant.plan_max_usuarios ?? '—') },
                { label: 'API ambiente',      value: tenant.api_ambiente ?? '—' },
                { label: 'API usuario',       value: tenant.api_usuario ?? '—' },
                { label: 'Firma NIT',         value: tenant.firma_nit ?? '—' },
                { label: 'Firma vence',       value: tenant.firma_vence ? new Date(tenant.firma_vence).toLocaleDateString('es-SV') : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: `1px solid ${colors.borderLight}` }}>
                  <span style={{ fontSize: 13, color: colors.textMuted }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pagos */}
      {tab === 'pagos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Registrar pago</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monto ($)</label>
                <input type="number" min={0} value={pagoForm.monto} onChange={e => setPagoForm(p => ({ ...p, monto: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha pago</label>
                <input type="date" value={pagoForm.fecha_pago ?? ''} onChange={e => setPagoForm(p => ({ ...p, fecha_pago: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nueva fecha vencimiento</label>
                <input type="date" value={pagoForm.nueva_fecha_vencimiento ?? ''} onChange={e => setPagoForm(p => ({ ...p, nueva_fecha_vencimiento: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Método</label>
                <input type="text" placeholder="Transferencia, efectivo..." value={pagoForm.metodo ?? ''} onChange={e => setPagoForm(p => ({ ...p, metodo: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notas</label>
                <textarea value={pagoForm.notas ?? ''} onChange={e => setPagoForm(p => ({ ...p, notas: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button onClick={handlePago} disabled={pagoSaving || pagoForm.monto <= 0}
                style={{ padding: '10px 20px', background: pagoSaving ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                {pagoSaving ? 'Guardando...' : 'Registrar pago'}
              </button>
            </div>
          </div>
          <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Historial de pagos</p>
            {pagos.length === 0
              ? <p style={{ color: colors.textMuted, fontSize: 13 }}>Sin pagos registrados</p>
              : (pagos as Array<Record<string, unknown>>).map((p, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.borderLight}`, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>${String(p.monto)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>{String(p.metodo ?? '—')}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>{p.fecha_pago ? new Date(String(p.fecha_pago)).toLocaleDateString('es-SV') : '—'}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Tab: Usuarios */}
      {tab === 'usuarios' && (
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={16} color="#0891b2" />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Usuarios del tenant</p>
          </div>
          {usuarios.length === 0
            ? <p style={{ color: colors.textMuted, fontSize: 13 }}>Sin usuarios</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['ID', 'Username', 'Nombre', 'Rol'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usuarios as Array<Record<string, unknown>>).map((u, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: '8px 12px', color: colors.textMuted }}>{String(u.id)}</td>
                      <td style={{ padding: '8px 12px', color: colors.textPrimary, fontWeight: 500 }}>{String(u.username ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(u.nombre ?? u.name ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(u.rol ?? u.role ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* Tab: DTE */}
      {tab === 'dte' && (
        <div style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText size={16} color="#0891b2" />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Correlativos DTE</p>
          </div>
          {dteList.length === 0
            ? <p style={{ color: colors.textMuted, fontSize: 13 }}>Sin correlativos configurados</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['Tipo', 'Código', 'Serie', 'Correlativo', 'Ambiente'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(dteList as Array<Record<string, unknown>>).map((d, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: '8px 12px', color: colors.textPrimary, fontWeight: 500 }}>{String(d.tipo_dte ?? d.tipo ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(d.codigo_generacion_prefix ?? d.codigo ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(d.serie ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(d.correlativo ?? d.numero_control ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: colors.textSecondary }}>{String(d.ambiente ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* CreditCard import used implicitly */}
      <span style={{ display: 'none' }}><CreditCard size={0} /></span>
    </div>
  );
}
