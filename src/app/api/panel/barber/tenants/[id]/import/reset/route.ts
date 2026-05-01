import { NextRequest, NextResponse } from 'next/server';
import { guardEnv } from '@/lib/panel-api';

function getBarberBase() {
  return `${guardEnv('BARBER_PANEL_URL').replace(/\/$/, '')}/api/superadmin`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${getBarberBase()}/tenants/${id}/import/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${guardEnv('BARBER_SUPERADMIN_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
