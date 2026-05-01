import { NextRequest, NextResponse } from 'next/server';
import { guardEnv } from '@/lib/panel-api';

function getBarberBase() {
  return `${guardEnv('BARBER_PANEL_URL').replace(/\/$/, '')}/api/superadmin`;
}
function getAuthHeader() {
  return `Bearer ${guardEnv('BARBER_SUPERADMIN_API_KEY')}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const res = await fetch(`${getBarberBase()}/tenants/${id}/import`, {
    method: 'POST',
    headers: { Authorization: getAuthHeader() },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
