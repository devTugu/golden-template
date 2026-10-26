import { NextRequest, NextResponse } from 'next/server';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { catchUpstreamConnection } from '@/shared/lib/bff-upstream';
import { assertCsrf } from '@/shared/lib/bff-csrf';

export async function proxyAuthMutationNoContent(
  request: NextRequest,
  upstreamPath: string,
): Promise<NextResponse> {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = await request.text();

  try {
    const upstream = await fetchInternal(
      upstreamPath,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
      request,
    );

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const envelope = await parseInternalJson(upstream);
    return NextResponse.json(envelope, { status: upstream.status });
  } catch (error) {
    const upstream = catchUpstreamConnection(error);
    if (upstream) {
      return upstream;
    }
    throw error;
  }
}
