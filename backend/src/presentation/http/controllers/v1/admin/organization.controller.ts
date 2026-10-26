import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AddOrganizationMemberUseCase,
  CreateOrganizationUseCase,
  ListOrganizationMembersUseCase,
  ListOrganizationsUseCase,
  UpdateOrganizationUseCase,
} from '@application/organization/use-cases/organization.use-cases';
import { Permissions } from '../../../decorators/permissions.decorator';
import {
  AddOrganizationMemberDto,
  CreateOrganizationDto,
  ListOrganizationsQueryDto,
  UpdateOrganizationDto,
} from '../../../dto/v1/organization.dto';

@ApiTags('Organizations v1')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/organizations', version: '1' })
export class OrganizationAdminV1Controller {
  constructor(
    private readonly listOrganizations: ListOrganizationsUseCase,
    private readonly createOrganization: CreateOrganizationUseCase,
    private readonly updateOrganization: UpdateOrganizationUseCase,
    private readonly listMembers: ListOrganizationMembersUseCase,
    private readonly addMember: AddOrganizationMemberUseCase,
  ) {}

  @Get()
  @Permissions('ORGANIZATION_READ')
  @ApiOperation({ summary: 'List organizations' })
  list(@Query() query: ListOrganizationsQueryDto) {
    return this.listOrganizations.execute(query.page, query.limit);
  }

  @Post()
  @Permissions('ORGANIZATION_WRITE')
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.createOrganization.execute(dto);
  }

  @Patch(':id')
  @Permissions('ORGANIZATION_WRITE')
  @ApiOperation({ summary: 'Update organization' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.updateOrganization.execute(id, dto);
  }

  @Get(':id/members')
  @Permissions('ORGANIZATION_READ')
  @ApiOperation({ summary: 'List organization members' })
  members(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListOrganizationsQueryDto,
  ) {
    return this.listMembers.execute(id, query.page, query.limit);
  }

  @Post(':id/members')
  @Permissions('ORGANIZATION_WRITE')
  @ApiOperation({ summary: 'Add organization member' })
  add(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOrganizationMemberDto,
  ) {
    return this.addMember.execute(id, dto.userId, dto.role);
  }
}
