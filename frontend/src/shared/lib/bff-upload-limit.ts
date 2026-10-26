import { NextResponse } from 'next/server';

const DEFAULT_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export function mediaMaxBytes(): number {
  const raw = process.env.MEDIA_MAX_BYTES;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MEDIA_MAX_BYTES;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MEDIA_MAX_BYTES;
}

function payloadTooLargeResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'File exceeds maximum upload size.',
      },
    },
    { status: 413 },
  );
}

export function rejectOversizeMediaUpload(input: {
  upstreamPath: string;
  contentLengthHeader: string | null;
  body: BodyInit | undefined;
}): NextResponse | null {
  if (input.upstreamPath !== '/admin/media/upload') return null;

  const maxUpload = mediaMaxBytes();
  if (input.contentLengthHeader) {
    const length = Number.parseInt(input.contentLengthHeader, 10);
    if (length > maxUpload) return payloadTooLargeResponse();
  }

  if (input.body instanceof ArrayBuffer && input.body.byteLength > maxUpload) {
    return payloadTooLargeResponse();
  }

  return null;
}
