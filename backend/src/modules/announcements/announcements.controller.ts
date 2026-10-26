import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@presentation/http/decorators/permissions.decorator';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  ListAnnouncementsQueryDto,
  UpdateAnnouncementDto,
} from './dto/announcements.dto';

@ApiTags('Announcements (Admin) v1')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/announcements', version: '1' })
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  @Permissions('ANNOUNCEMENT_READ')
  @ApiOperation({ summary: 'List announcements' })
  findAll(@Query() query: ListAnnouncementsQueryDto) {
    return this.announcements.list(query);
  }

  @Get(':id')
  @Permissions('ANNOUNCEMENT_READ')
  @ApiOperation({ summary: 'Get announcement' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcements.get(id);
  }

  @Post()
  @Permissions('ANNOUNCEMENT_CREATE')
  @ApiOperation({ summary: 'Create announcement' })
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcements.create(dto);
  }

  @Put(':id')
  @Permissions('ANNOUNCEMENT_UPDATE')
  @ApiOperation({ summary: 'Update announcement' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcements.update(id, dto);
  }

  @Delete(':id')
  @Permissions('ANNOUNCEMENT_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete announcement' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.announcements.remove(id);
  }
}
