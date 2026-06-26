import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { Role } from '../modules/auth/enums/role.enum';
import { LltcoursetargetService } from './lltcoursetarget.service';
import { CreateLltcoursetargetDto } from './dto/create-lltcoursetarget.dto';
import { UpdateLltcoursetargetDto } from './dto/update-lltcoursetarget.dto';
import { Lltcoursetarget } from './entities/lltcoursetarget.entity';

@ApiTags('lltcoursetarget')
@Controller('lltcoursetarget')
export class LltcoursetargetController {
  constructor(private readonly lltcoursetargetService: LltcoursetargetService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create course target link' })
  create(
    @Body() dto: CreateLltcoursetargetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursetarget> {
    return this.lltcoursetargetService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List course target links' })
  findAll(): Promise<Lltcoursetarget[]> {
    return this.lltcoursetargetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course target link detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltcoursetarget> {
    return this.lltcoursetargetService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update course target link' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltcoursetargetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursetarget> {
    return this.lltcoursetargetService.update(id, dto, user.username);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete course target link' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.lltcoursetargetService.remove(id);
  }
}
