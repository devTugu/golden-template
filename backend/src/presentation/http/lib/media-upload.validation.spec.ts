import { validateMediaUploadFile } from './media-upload.validation';

describe('validateMediaUploadFile', () => {
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
  ]);

  it('rejects missing file', () => {
    expect(() => validateMediaUploadFile(undefined, 1024)).toThrow(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('rejects oversize file', () => {
    expect(() =>
      validateMediaUploadFile(
        {
          size: 2000,
          mimetype: 'image/png',
          buffer: pngBuffer,
          originalname: 'x.png',
        } as Express.Multer.File,
        1000,
      ),
    ).toThrow(expect.objectContaining({ statusCode: 413 }));
  });
});
