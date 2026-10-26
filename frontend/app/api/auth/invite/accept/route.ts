import type { NextRequest } from 'next/server';
import { proxyAuthMutationNoContent } from '@/shared/lib/bff-auth-no-content';

export async function POST(request: NextRequest) {
  return proxyAuthMutationNoContent(request, '/auth/invite/accept');
}
