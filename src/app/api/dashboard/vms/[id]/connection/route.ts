import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id } = await params;
  const vm = await prisma.provisionedVm.findUnique({
    where: { id },
    include: { order: true },
  });

  if (!vm || vm.order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  if (vm.connectionState !== 'ready' || vm.status !== 'vm_ready') {
    return NextResponse.json(
      { error: 'VM não está pronta para conexão' },
      { status: 400 }
    );
  }

  const metadata = vm.connectionMetadata as { peerId?: string } | null;
  const peerId = metadata?.peerId;

  return NextResponse.json({
    ipAddress: vm.ipAddress,
    hostname: vm.hostname,
    connectionMethod: vm.connectionMethod,
    ...(peerId && { peerId }),
  });
}
