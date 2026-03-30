
import { CreditCard } from 'lucide-react';
import { colors, shadow } from '@/styles/colors';

const PLANES = [
  { name: 'TRIAL',      price: '$0',   duration: '30 días', maxBarbers: 2,  features: ['2 barberos', 'Citas básicas', 'POS básico'] },
  { name: 'BASIC',      price: '$19',  duration: '/mes',    maxBarbers: 5,  features: ['5 barberos', 'POS completo', 'Inventario'] },
  { name: 'PRO',        price: '$49',  duration: '/mes',    maxBarbers: 15, features: ['15 barberos', 'DTE/Facturas', 'Reportes', 'Gastos'] },
  { name: 'ENTERPRISE', price: '$99',  duration: '/mes',    maxBarbers: 99, features: ['Ilimitados', 'Todo incluido', 'Soporte prioritario'] },
];

const COLORS: Record<string, string> = { TRIAL: '#6b7280', BASIC: '#6366f1', PRO: '#0891b2', ENTERPRISE: '#7c3aed' };

export default function BarberPlanesPage() {
  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <CreditCard size={22} color="#059669" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>Planes BarberPro</h1>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>Estructura de planes del sistema</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {PLANES.map(plan => (
          <div key={plan.name} style={{ background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: 24, borderTop: `3px solid ${COLORS[plan.name]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[plan.name], background: COLORS[plan.name] + '18', borderRadius: 6, padding: '3px 10px' }}>{plan.name}</span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: colors.textPrimary }}>{plan.price}</p>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: colors.textMuted }}>{plan.duration}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[plan.name], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: '#fefce8', borderRadius: 12, border: '1px solid #fde68a', padding: '14px 18px', fontSize: 13, color: '#92400e' }}>
        Los precios y límites son informativos. Para modificar los planes disponibles en el sistema, editar directamente el enum <code>BarberPlan</code> en el schema de BarberPro.
      </div>
    </div>
  );
}
