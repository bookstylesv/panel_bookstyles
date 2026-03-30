/**
 * App.tsx — Layout principal del panel Speeddan Control.
 * Sidebar multi-producto + área de contenido + routing.
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Map, MapPin, Activity, Shield, Globe,
  BarChart2, HardDrive, LogOut, ChevronLeft, ChevronRight, ShieldCheck,
  Scissors, Building2, Boxes, FileText,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors, radius, shadow } from '@/styles/colors';

// Pages
import LoginPage             from '@/pages/LoginPage';
import OverviewPage          from '@/pages/overview/OverviewPage';
import DteDashboardPage      from '@/pages/dte/DteDashboardPage';
import DteClientesPage       from '@/pages/dte/DteClientesPage';
import DteClienteDetallePage from '@/pages/dte/DteClienteDetallePage';
import DtePlanesPage         from '@/pages/dte/DtePlanesPage';
import DteDepartamentosPage  from '@/pages/dte/DteDepartamentosPage';
import DteMunicipiosPage     from '@/pages/dte/DteMunicipiosPage';
import DteAnalyticsPage      from '@/pages/dte/DteAnalyticsPage';
import DteHealthPage         from '@/pages/dte/DteHealthPage';
import DteAuditoriaPage      from '@/pages/dte/DteAuditoriaPage';
import DteMapaPage           from '@/pages/dte/DteMapaPage';
import DteBackupsPage        from '@/pages/dte/DteBackupsPage';
import BarberDashboardPage   from '@/pages/barber/BarberDashboardPage';
import BarberTenantsPage     from '@/pages/barber/BarberTenantsPage';
import BarberTenantDetallePage from '@/pages/barber/BarberTenantDetallePage';
import BarberPlanesPage      from '@/pages/barber/BarberPlanesPage';
import BarberHealthPage      from '@/pages/barber/BarberHealthPage';
import ErpComingSoonPage     from '@/pages/erp/ErpComingSoonPage';

// ── Estructura del sidebar ────────────────────────────────────────────────────

interface NavItem {
  to:       string;
  label:    string;
  icon:     React.ComponentType<{ size?: number }>;
  disabled?: boolean;
}

interface NavSection {
  id:       string;
  label:    string;
  color:    string;
  sectionIcon?: React.ComponentType<{ size?: number }>;
  items:    NavItem[];
  badge?:   string;
  disabled?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview', label: 'General', color: '#6366f1', sectionIcon: LayoutDashboard,
    items: [
      { to: '/overview', label: 'Vista Global', icon: LayoutDashboard },
    ],
  },
  {
    id: 'dte', label: 'DTE Facturación', color: '#0891b2', sectionIcon: FileText,
    items: [
      { to: '/dte/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
      { to: '/dte/clientes',      label: 'Clientes',     icon: Users           },
      { to: '/dte/planes',        label: 'Planes',       icon: CreditCard      },
      { to: '/dte/departamentos', label: 'Departamentos',icon: Map             },
      { to: '/dte/municipios',    label: 'Municipios',   icon: MapPin          },
      { to: '/dte/analytics',     label: 'Analytics',    icon: BarChart2       },
      { to: '/dte/health',        label: 'Health',       icon: Activity        },
      { to: '/dte/auditoria',     label: 'Auditoría',    icon: Shield          },
      { to: '/dte/mapa',          label: 'Mapa',         icon: Globe           },
      { to: '/dte/backups',       label: 'Backups',      icon: HardDrive       },
    ],
  },
  {
    id: 'barber', label: 'BarberPro', color: '#059669', sectionIcon: Scissors,
    items: [
      { to: '/barber/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { to: '/barber/tenants',   label: 'Barberías',  icon: Building2       },
      { to: '/barber/planes',    label: 'Planes',      icon: CreditCard      },
      { to: '/barber/health',    label: 'Health',      icon: Activity        },
    ],
  },
  {
    id: 'erp', label: 'ERP Full Pro', color: '#9ca3af', sectionIcon: Boxes, badge: 'Próximamente', disabled: true,
    items: [
      { to: '/erp', label: 'ERP Full Pro', icon: Boxes, disabled: true },
    ],
  },
];

// ── Layout ────────────────────────────────────────────────────────────────────

function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpanded] = useState<Record<string, boolean>>({
    overview: true, dte: true, barber: true, erp: false,
  });

  const handleLogout = () => { logout(); navigate('/login'); };
  const sidebarW     = collapsed ? 60 : 240;

  const toggleSection = (id: string) => {
    if (collapsed) return;
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <aside className="erp-sidebar" style={{
        width: sidebarW, flexShrink: 0, background: colors.sidebarBg,
        borderRight: `1px solid ${colors.border}`, boxShadow: shadow.card,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease', overflow: 'hidden', position: 'relative',
      }}>

        {/* Header */}
        <div style={{ padding: collapsed ? '18px 12px 14px' : '18px 18px 14px', borderBottom: `1px solid ${colors.borderLight}`, display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 64 }}>
          <div style={{ width: 34, height: 34, background: '#111111', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={17} color="#ffffff" />
          </div>
          {!collapsed && (
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap' }}>Speeddan Control</p>
              <p style={{ margin: 0, fontSize: 11, color: colors.textMuted, whiteSpace: 'nowrap' }}>Panel central</p>
            </div>
          )}
        </div>

        {/* Botón colapsar */}
        <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Colapsar'}
          style={{ position: 'absolute', top: 50, right: -12, width: 24, height: 24, borderRadius: '50%', background: colors.cardBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: shadow.card, zIndex: 10, padding: 0, color: colors.textSecondary }}>
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '10px 6px' : '10px 10px', overflowY: 'auto' }}>
          {NAV_SECTIONS.map(section => {
            const SectionIcon = section.sectionIcon;
            const isExpanded  = expandedSections[section.id] !== false;
            return (
              <div key={section.id} style={{ marginBottom: 6 }}>
                {!collapsed && (
                  <button onClick={() => toggleSection(section.id)} disabled={section.disabled}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', background: 'none', border: 'none', cursor: section.disabled ? 'default' : 'pointer', opacity: section.disabled ? 0.4 : 1, marginBottom: 2 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {section.label}
                    </span>
                    {section.badge && (
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', borderRadius: 4, padding: '1px 5px', whiteSpace: 'nowrap' }}>
                        {section.badge}
                      </span>
                    )}
                    {SectionIcon && <SectionIcon size={11} />}
                  </button>
                )}

                {(collapsed || isExpanded) && section.items.map(({ to, label, icon: Icon, disabled }) => (
                  disabled ? (
                    <div key={to} title={collapsed ? label : undefined}
                      style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '8px 10px', borderRadius: radius.md, fontSize: 13, color: '#d1d5db', opacity: 0.5, cursor: 'not-allowed', marginBottom: 1 }}>
                      <Icon size={collapsed ? 16 : 14} />
                      {!collapsed && label}
                    </div>
                  ) : (
                    <NavLink key={to} to={to} title={collapsed ? label : undefined}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9, justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '9px 0' : '8px 10px', borderRadius: radius.md,
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : colors.textSecondary,
                        background: isActive ? section.color : 'transparent',
                        textDecoration: 'none', marginBottom: 1, transition: 'all 0.12s',
                      })}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; if (el.style.background === 'transparent') el.style.background = colors.mutedBg; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; if (el.style.background === colors.mutedBg) el.style.background = 'transparent'; }}
                    >
                      <Icon size={collapsed ? 16 : 14} />
                      {!collapsed && label}
                    </NavLink>
                  )
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer usuario */}
        <div style={{ padding: collapsed ? '12px 6px' : '12px 14px', borderTop: `1px solid ${colors.borderLight}` }}>
          {!collapsed && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: colors.textMuted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.username}
            </p>
          )}
          <button onClick={handleLogout} title={collapsed ? 'Cerrar sesión' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8, justifyContent: collapsed ? 'center' : 'flex-start', background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: collapsed ? '8px 0' : '8px 10px', fontSize: 12, color: colors.textSecondary, cursor: 'pointer' }}>
            <LogOut size={13} />
            {!collapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Routes>
          <Route path="overview"           element={<OverviewPage />} />
          <Route path="dte/dashboard"      element={<DteDashboardPage />} />
          <Route path="dte/clientes"       element={<DteClientesPage />} />
          <Route path="dte/clientes/:id"   element={<DteClienteDetallePage />} />
          <Route path="dte/planes"         element={<DtePlanesPage />} />
          <Route path="dte/departamentos"  element={<DteDepartamentosPage />} />
          <Route path="dte/municipios"     element={<DteMunicipiosPage />} />
          <Route path="dte/analytics"      element={<DteAnalyticsPage />} />
          <Route path="dte/health"         element={<DteHealthPage />} />
          <Route path="dte/auditoria"      element={<DteAuditoriaPage />} />
          <Route path="dte/mapa"           element={<DteMapaPage />} />
          <Route path="dte/backups"        element={<DteBackupsPage />} />
          <Route path="barber/dashboard"   element={<BarberDashboardPage />} />
          <Route path="barber/tenants"     element={<BarberTenantsPage />} />
          <Route path="barber/tenants/:id" element={<BarberTenantDetallePage />} />
          <Route path="barber/planes"      element={<BarberPlanesPage />} />
          <Route path="barber/health"      element={<BarberHealthPage />} />
          <Route path="erp/*"              element={<ErpComingSoonPage />} />
          <Route path="*"                  element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── Guard ─────────────────────────────────────────────────────────────────────

function AppGuard() {
  const { session } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/overview" replace /> : <LoginPage />} />
      <Route path="/*"     element={session ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGuard />
    </AuthProvider>
  );
}
