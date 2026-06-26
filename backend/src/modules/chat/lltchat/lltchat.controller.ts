import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { CreateLltchatDto } from './dto/create-lltchat.dto';
import { UpdateLltchatDto } from './dto/update-lltchat.dto';
import { Lltchat } from './entities/lltchat.entity';
import { LltchatService } from './lltchat.service';

@ApiTags('lltchat')
@Controller('lltchat')
export class LltchatController {
  constructor(private readonly lltchatService: LltchatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat message' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createLltchatDto: CreateLltchatDto,
  ): Promise<Lltchat> {
    if (createLltchatDto.enrollId && user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.lltchatService.verifyEnrollmentOwnership(createLltchatDto.enrollId, user.lltumSub);
    }
    return this.lltchatService.create(createLltchatDto, user.lltumSub, user.username);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiOperation({ summary: 'Get all chat messages' })
  findAll(): Promise<Lltchat[]> {
    return this.lltchatService.findAll();
  }

  @Get('enroll/:enrollId')
  @ApiOperation({ summary: 'Get chat messages by enrollment ID' })
  async findByEnrollId(
    @CurrentUser() user: JwtPayload,
    @Param('enrollId', ParseIntPipe) enrollId: number,
  ): Promise<Lltchat[]> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.lltchatService.verifyEnrollmentOwnership(enrollId, user.lltumSub);
    }
    return this.lltchatService.findByEnrollId(enrollId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat message by ID' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Lltchat> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.lltchatService.verifyChatAccess(id, user.lltumSub);
    }
    return this.lltchatService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a chat message by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLltchatDto: UpdateLltchatDto,
  ): Promise<Lltchat> {
    return this.lltchatService.update(id, updateLltchatDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat message by ID' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    return this.lltchatService.remove(id);
  }
}
