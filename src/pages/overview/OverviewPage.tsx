/**
 * OverviewPage.tsx — Vista global de los 3 productos.
 * Carga stats en paralelo y muestra tarjetas por producto con indicador de estado.
 */

import { useEffect, useState } from 'react';
import { FileText, Scissors, Boxes,  CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { colors, shadow } from '@/styles/colors';
import { dteSvc, type DteDashboardStats } from '@/services/dte.service';
import { barberSvc, type BarberDashboardStats } from '@/services/barber.service';

interface ProductCard {
  id:      string;
  label:   string;
  color:   string;
  icon:    React.ComponentType<{ size?: number; color?: string }>;
  url:     string;
  stats:   { label: string; value: string | number }[];
  status:  'ok' | 'error' | 'loading' | 'coming_soon';
}

const PAGE_STYLE: React.CSSProperties = { padding: 32, fontFamily: "'Inter', sans-serif" };
const CARD_STYLE: React.CSSProperties = { background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: '24px', flex: 1, minWidth: 280 };

function StatusDot({ status }: { status: ProductCard['status'] }) {
  const map = {
    ok:          { color: '#10b981', label: 'Conectado' },
    error:       { color: '#ef4444', label: 'Error de conexión' },
    loading:     { color: '#f59e0b', label: 'Cargando...' },
    coming_soon: { color: '#9ca3af', label: 'Próximamente' },
  };
  const { color, label } = map[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function OverviewPage() {
  const [dteStats,    setDteStats]    = useState<DteDashboardStats | null>(null);
  const [barberStats, setBarberStats] = useState<BarberDashboardStats | null>(null);
  const [dteStatus,   setDteStatus]   = useState<ProductCard['status']>('loading');
  const [barberStatus,setBarberStatus]= useState<ProductCard['status']>('loading');

  useEffect(() => {
    // DTE
    dteSvc.getDashboard()
      .then(data => { setDteStats(data); setDteStatus('ok'); })
      .catch(() => setDteStatus('error'));

    // BarberPro
    barberSvc.getDashboard()
      .then(data => { setBarberStats(data); setBarberStatus('ok'); })
      .catch(() => setBarberStatus('error'));
  }, []);

  const cards: ProductCard[] = [
    {
      id: 'dte', label: 'DTE Facturación', color: '#0891b2', icon: FileText,
      url: import.meta.env.VITE_DTE_API_URL || '',
      status: dteStatus,
      stats: dteStats ? [
        { label: 'Total clientes',    value: dteStats.total },
        { label: 'Activos',           value: dteStats.activos },
        { label: 'En pruebas',        value: dteStats.en_pruebas },
        { label: 'MRR',               value: `$${dteStats.mrr?.toFixed(2) ?? '0.00'}` },
      ] : [],
    },
    {
      id: 'barber', label: 'BarberPro', color: '#059669', icon: Scissors,
      url: import.meta.env.VITE_BARBER_API_URL || '',
      status: barberStatus,
      stats: barberStats ? [
        { label: 'Total barberías',   value: barberStats.totalTenants },
        { label: 'Activas',           value: barberStats.activeTenants },
        { label: 'En prueba',         value: barberStats.trialTenants },
        { label: 'Suspendidas',       value: barberStats.suspendedTenants },
      ] : [],
    },
    {
      id: 'erp', label: 'ERP Full Pro', color: '#9ca3af', icon: Boxes,
      url: '', status: 'coming_soon',
      stats: [],
    },
  ];

  return (
    <div style={PAGE_STYLE}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: '0 0 4px' }}>Vista Global</h1>
        <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>Estado de todos tus productos SaaS</p>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.id} style={CARD_STYLE}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, background: card.color + '18', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{card.label}</p>
                    <StatusDot status={card.status} />
                  </div>
                </div>
              </div>

              {card.status === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: 16, background: '#f0f0f0', borderRadius: 6, width: i % 2 === 0 ? '60%' : '80%' }} />
                  ))}
                </div>
              )}

              {card.status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#fef2f2', borderRadius: 10 }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <span style={{ fontSize: 13, color: '#dc2626' }}>No se pudo conectar al servicio</span>
                </div>
              )}

              {card.status === 'coming_soon' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#f3f4f6', borderRadius: 10 }}>
                  <Clock size={16} color="#9ca3af" />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Pendiente de deploy en producción</span>
                </div>
              )}

              {card.status === 'ok' && card.stats.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {card.stats.map(stat => (
                    <div key={stat.label} style={{ background: '#fafafa', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>{stat.label}</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda global */}
      <div style={{ marginTop: 28, background: colors.cardBg, borderRadius: 14, boxShadow: shadow.card, padding: '20px 24px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Estado de conexiones</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { icon: CheckCircle, color: '#10b981', label: 'Conectado — datos en tiempo real' },
            { icon: AlertCircle, color: '#ef4444', label: 'Sin conexión — verificar API key o URL' },
            { icon: Clock,       color: '#9ca3af', label: 'Próximamente — servicio no desplegado aún' },
          ].map(({ icon: LegIcon, color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LegIcon size={14} color={color} />
              <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
