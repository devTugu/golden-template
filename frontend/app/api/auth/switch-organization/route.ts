import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAMES,
} from '@/shared/lib/auth-cookies';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { buildTokenPairResponse } from '@/shared/lib/bff-auth-response';
import { catchUpstreamConnection } from '@/shared/lib/bff-upstream';
import { assertCsrf } from '@/shared/lib/bff-csrf';
import type { TokenPair } from '@/shared/api/types';

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const accessToken = request.cookies.get(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing access token' },
      },
      { status: 401 },
    );
  }

  const body = await request.text();

  try {
    const upstream = await fetchInternal(
      '/auth/switch-organization',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      },
      request,
    );

    const envelope = await parseInternalJson<TokenPair>(upstream);

    if (!upstream.ok) {
      return NextResponse.json(envelope, { status: upstream.status });
    }

    return buildTokenPairResponse(envelope.data);
  } catch (error) {
    const upstream = catchUpstreamConnection(error);
    if (upstream) {
      return upstream;
    }
    throw error;
  }
}
