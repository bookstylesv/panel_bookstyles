# Speeddan Control V3

Panel central superadmin construido con Next.js App Router + Ant Design para integrar:

- `factura-dte`
- `barber-pro`
- `Erp-full-web`

## Principios

- App Router desde el inicio
- Integraciones server-side, no tokens privilegiados en cliente
- Tema visual basado en variables CSS semanticas
- Ant Design alimentado por tokens, sin colores hardcodeados en componentes
- Estructura alineada con `speeddan-control-v2` y la metodologia de `Erp-full-web`

## Variables requeridas

Configura las variables del archivo `.env.example` en Vercel para cada entorno.

## Integracion actual

- DTE: soporta API key server-side y fallback a login superadmin server-side
- Barber: integra `/api/superadmin/*`
- ERP: preparado para `/api/superadmin/*` en `Erp-full-web`
