import { AppErrors } from '@application/exceptions/application.exception';
import { IMediaStoragePort } from '@application/ports/media-storage.port';

export class UploadMediaUseCase {
  constructor(private readonly storage: IMediaStoragePort) {}

  async execute(file: {
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }): Promise<{ url: string }> {
    if (!this.storage.isEnabled()) {
      throw AppErrors.BAD_REQUEST(
        'Media upload is not configured. Use image URLs instead.',
      );
    }
    return this.storage.upload(file);
  }
}
