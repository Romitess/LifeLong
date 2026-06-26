import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { LltsubtargetService } from './lltsubtarget.service';
import { CreateLltsubtargetDto } from './dto/create-lltsubtarget.dto';
import { UpdateLltsubtargetDto } from './dto/update-lltsubtarget.dto';
import { Lltsubtarget } from './entities/lltsubtarget.entity';

@ApiTags('lltsubtarget')
@Roles(Role.Admin)
@Controller('lltsubtarget')
export class LltsubtargetController {
  constructor(private readonly lltsubtargetService: LltsubtargetService) {}

  @Post()
  @ApiOperation({ summary: 'Create course subtarget' })
  create(@Body() dto: CreateLltsubtargetDto): Promise<Lltsubtarget> {
    return this.lltsubtargetService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all course subtargets' })
  findAll(): Promise<Lltsubtarget[]> {
    return this.lltsubtargetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course subtarget detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltsubtarget> {
    return this.lltsubtargetService.findOne(id);
  }

  @Get('target/:targetId')
  @ApiOperation({ summary: 'List course subtargets by target ID' })
  findByTargetId(@Param('targetId', ParseIntPipe) targetId: number): Promise<Lltsubtarget[]> {
    return this.lltsubtargetService.findByTargetId(targetId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course subtarget' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltsubtargetDto,
  ): Promise<Lltsubtarget> {
    return this.lltsubtargetService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course subtarget' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.lltsubtargetService.remove(id);
  }
}
