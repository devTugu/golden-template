import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationCaptureStore } from '@infrastructure/notification/notification-capture.store';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Dev')
@Controller({ path: 'dev/notifications', version: '1' })
export class DevNotificationsV1Controller {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List captured auth emails (NOTIFICATION_CAPTURE only)',
  })
  listCaptured() {
    if (this.config.get<string>('NOTIFICATION_CAPTURE') !== 'true') {
      throw new NotFoundException();
    }
    return { items: NotificationCaptureStore.list() };
  }

  @Public()
  @Get('reset')
  @ApiOperation({
    summary: 'Latest password reset URL (NOTIFICATION_CAPTURE only)',
  })
  latestResetUrl() {
    if (this.config.get<string>('NOTIFICATION_CAPTURE') !== 'true') {
      throw new NotFoundException();
    }
    return {
      resetUrl: NotificationCaptureStore.latestPasswordResetUrl() ?? null,
    };
  }
}
