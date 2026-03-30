
import { Boxes } from 'lucide-react';
import { colors, shadow } from '@/styles/colors';

export default function ErpComingSoonPage() {
  return (
    <div style={{ padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: colors.cardBg, borderRadius: 16, boxShadow: shadow.card, padding: '64px 48px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ width: 72, height: 72, background: '#f3f4f6', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Boxes size={36} color="#9ca3af" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: '0 0 10px' }}>ERP Full Pro</h2>
        <p style={{ fontSize: 14, color: colors.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>
          Este producto está en desarrollo activo. Estará disponible en el panel central una vez que sea desplegado en producción.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 8, padding: '8px 16px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próximamente</span>
        </div>
      </div>
    </div>
  );
}
