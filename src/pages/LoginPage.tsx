/**
 * LoginPage.tsx — Login del panel Speeddan Control.
 * Mismo diseño split-screen del superadmin DTE.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #e5e5e5', borderRadius: 10,
  fontSize: 14, color: '#111111', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  background: '#fafafa',
};

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) { setError('Usuario y contraseña son requeridos'); return; }
    setLoading(true);
    try {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate('/overview');
      } else {
        setError('Credenciales inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Panel izquierdo */}
      {!isMobile && (
        <div style={{ flex: '0 0 45%', background: '#111111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#ffffff' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ShieldCheck size={40} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Speeddan Control</h1>
            <p style={{ fontSize: 14, margin: '0 0 52px', opacity: 0.65 }}>Panel central de administración</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              {['Gestiona DTE, BarberPro y ERP Full Pro', 'Control de tenants y suscripciones', 'Vista global de todos tus productos'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, opacity: 0.7 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel derecho */}
      <div style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            {isMobile && (
              <div style={{ width: 52, height: 52, background: '#111111', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldCheck size={26} color="#ffffff" />
              </div>
            )}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Acceso restringido</h2>
            <p style={{ fontSize: 14, color: '#9b9b9b', margin: 0 }}>Panel exclusivo para administradores del sistema</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b6b6b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus autoComplete="username" style={INPUT_STYLE}
                onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#fff'; }}
                onBlur={e  => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b6b6b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  style={{ ...INPUT_STYLE, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#fff'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9b9b9b', display: 'flex', padding: 2 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ marginTop: 8, padding: '13px', background: loading ? '#c8c8c8' : '#111111', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
