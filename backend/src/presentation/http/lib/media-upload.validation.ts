import { AppErrors } from '@application/exceptions/application.exception';
import {
  bufferMatchesMimeType,
  sanitizeFilename,
} from '@shared/utils/file-signature.util';

export const ALLOWED_MEDIA_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function validateMediaUploadFile(
  file: Express.Multer.File | undefined,
  maxBytes: number,
): { buffer: Buffer; mimeType: string; filename: string } {
  if (!file) {
    throw AppErrors.BAD_REQUEST('File is required.');
  }
  if (file.size > maxBytes) {
    throw AppErrors.PAYLOAD_TOO_LARGE('File exceeds maximum upload size.');
  }
  if (!ALLOWED_MEDIA_MIME.has(file.mimetype)) {
    throw AppErrors.BAD_REQUEST('Unsupported file type.');
  }
  if (!bufferMatchesMimeType(file.buffer, file.mimetype)) {
    throw AppErrors.BAD_REQUEST('File content does not match declared type.');
  }
  return {
    buffer: file.buffer,
    mimeType: file.mimetype,
    filename: sanitizeFilename(file.originalname),
  };
}
