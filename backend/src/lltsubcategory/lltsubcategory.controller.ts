import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { Role } from '../modules/auth/enums/role.enum';
import { AdminSubcategoryDetailResponse, LltsubcategoryService } from './lltsubcategory.service';
import { CreateLltsubcategoryDto } from './dto/create-lltsubcategory.dto';
import { UpdateLltsubcategoryDto } from './dto/update-lltsubcategory.dto';

@ApiTags('admin-subcategories')
@Roles(Role.Admin)
@Controller('admin/subcategories')
export class LltsubcategoryController {
  constructor(private readonly lltsubcategoryService: LltsubcategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create subcategory' })
  create(
    @Body() dto: CreateLltsubcategoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AdminSubcategoryDetailResponse> {
    return this.lltsubcategoryService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List subcategories' })
  findAll(): Promise<AdminSubcategoryDetailResponse[]> {
    return this.lltsubcategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subcategory detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminSubcategoryDetailResponse> {
    return this.lltsubcategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subcategory' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltsubcategoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AdminSubcategoryDetailResponse> {
    return this.lltsubcategoryService.update(id, dto, user.username);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subcategory' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    return this.lltsubcategoryService.remove(id);
  }
}
