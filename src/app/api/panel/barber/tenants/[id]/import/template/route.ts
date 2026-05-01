import { NextRequest, NextResponse } from 'next/server';
import { guardEnv } from '@/lib/panel-api';

function getBarberBase() {
  return `${guardEnv('BARBER_PANEL_URL').replace(/\/$/, '')}/api/superadmin`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get('resource') ?? '';
  const res = await fetch(
    `${getBarberBase()}/tenants/${id}/import/template?resource=${resource}`,
    { headers: { Authorization: `Bearer ${guardEnv('BARBER_SUPERADMIN_API_KEY')}` } }
  );
  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="plantilla-${resource}.xlsx"`,
    },
  });
}
