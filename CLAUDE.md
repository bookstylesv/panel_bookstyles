# CLAUDE.md — Speeddan Control Panel

> **DIRECTIVAS DE SESIÓN** (seguir siempre):
> 1. **CONFIANZA 90%**: Antes de modificar cualquier archivo, si no tengo 90% de certeza de lo que debo hacer, hacer las preguntas necesarias al usuario primero.
> 2. **AGENTES Y SKILLS**: NO usar agentes ni skills automáticamente. Esperar instrucción explícita del usuario.
> 3. **TOKENS**: Leer solo los archivos que la tarea requiera. NO explorar el proyecto al inicio.

## Proyecto
Panel de control central **Speeddan** — monitorea y administra los 3 sistemas SaaS desde una sola interfaz.

| Sistema | URL API | Sección en panel |
|---------|---------|-----------------|
| BarberPro ERP | `speeddan-barberia.vercel.app` | `/barber/*` |
| FacturaDTE | `dte-speeddan.vercel.app` | `/dte/*` |
| ERP Full Pro | Pendiente | `/erp/*` |

## Stack
| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI | Ant Design v6 + Tailwind CSS v4 |
| Auth | JWT httpOnly cookie `speeddan_control_token` |
| Deploy | Vercel auto-deploy desde `master` |
| Color primario | `#7c3aed` (violeta, `--raw-primary`) |

## Estructura
```
src/
  app/
    (auth)/login/               → Login superadmin
    (dashboard)/                → Páginas protegidas
      overview/                   Vista global de los 3 sistemas
      barber/                     Dashboard, Tenants, Health, Config
      dte/                        Dashboard, Clientes, Planes, Health, etc.
      erp/                        Dashboard, Tenants, Health
    api/auth/                   → Login / logout / me
  components/
    layout/
      DashboardChrome.tsx         Layout principal: sidebar + topbar + hamburger móvil
      ControlSidebar.tsx          Sidebar: Drawer en móvil, Sider en tablet/desktop
    ui/
      PageHeader.tsx              Encabezado estándar de página (eyebrow + title + description + actions)
      MetricCard.tsx              Tarjeta KPI con accentVar + tone
      DataTable.tsx               Tabla HTML ligera para listas
    barber/ dte/                → Componentes específicos por sistema
  lib/
    integrations/
      barber.ts  dte.ts  erp.ts  → Fetch a cada API externa
    panel-api.ts                → Helper fetch con auth cookie
    panel-session.ts            → Leer sesión JWT
```

## Convenciones de diseño
- Usar **siempre `PageHeader`** para encabezados de página — nunca inline styles en el h1
- `MetricCard` para KPIs con `accentVar="--section-barber|dte|erp|overview"`
- `surface-card border-0` en Cards de contenido
- Tablas de datos → `DataTable` (no antd Table, salvo que sea compleja)
- **Responsive**: Drawer en `< 768px`, Sider colapsado en `768–1023px`, Sider expandido en `≥ 1024px`
- Variables de sección: `--section-dte` (azul), `--section-barber` (verde), `--section-erp` (naranja), `--section-overview` (violeta)

## Comandos
```bash
npm run dev       # desarrollo (puerto 3000)
npm run build     # next build
npm run typecheck # tsc --noEmit
```

## Credenciales
- Login: `admin` / `admin123` (superadmin único)
- Producción: pendiente de deploy
