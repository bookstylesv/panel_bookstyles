import { NextRequest, NextResponse } from 'next/server';
import { guardEnv } from '@/lib/panel-api';

function getBarberBase() {
  return `${guardEnv('BARBER_PANEL_URL').replace(/\/$/, '')}/api/superadmin`;
}
function getHeaders() {
  return { Authorization: `Bearer ${guardEnv('BARBER_SUPERADMIN_API_KEY')}` };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBarberBase()}/tenants/${id}/import/status`, { headers: getHeaders(), cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
