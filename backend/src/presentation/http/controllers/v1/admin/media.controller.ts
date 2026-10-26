import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadMediaUseCase } from '@application/media/use-cases/upload-media.use-case';
import { Permissions } from '../../../decorators/permissions.decorator';
import { validateMediaUploadFile } from '../../../lib/media-upload.validation';

@ApiTags('Media (Admin) v1')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/media', version: '1' })
export class MediaAdminV1Controller {
  constructor(
    private readonly uploadMedia: UploadMediaUseCase,
    private readonly config: ConfigService,
  ) {}

  @Post('upload')
  @Permissions('SITE_SETTING_UPDATE')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload media file (requires S3 config)' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    const maxBytes = this.config.get<number>(
      'MEDIA_MAX_BYTES',
      5 * 1024 * 1024,
    );
    const validated = validateMediaUploadFile(file, maxBytes);
    return this.uploadMedia.execute(validated);
  }
}
