import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { Public } from '../modules/auth/public.decorator';
import { LltfacultyService } from './lltfaculty.service';
import { CreateLltfacultyDto } from './dto/create-lltfaculty.dto';
import { UpdateLltfacultyDto } from './dto/update-lltfaculty.dto';
import { Lltfaculty } from './entities/lltfaculty.entity';

@ApiTags('lltfaculty')
@Roles(Role.Admin, Role.Finance, Role.CentralFinance)
@Controller('lltfaculty')
export class LltfacultyController {
  constructor(private readonly lltfacultyService: LltfacultyService) {}

  @Post()
  @ApiOperation({ summary: 'Create faculty' })
  create(@Body() dto: CreateLltfacultyDto): Promise<Lltfaculty> {
    return this.lltfacultyService.create(dto);
  }

  @Public()
  @Get('options')
  @ApiOperation({ summary: 'Get active faculty id+name for dropdowns (public)' })
  findOptions(): Promise<{ id: number; name: string | null }[]> {
    return this.lltfacultyService.findOptions();
  }

  @Get()
  @ApiOperation({ summary: 'List all faculties' })
  findAll(): Promise<Lltfaculty[]> {
    return this.lltfacultyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculty detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltfaculty> {
    return this.lltfacultyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update faculty' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltfacultyDto,
  ): Promise<Lltfaculty> {
    return this.lltfacultyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete faculty' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.lltfacultyService.remove(id);
  }
}
