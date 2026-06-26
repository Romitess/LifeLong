import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { AdminCategoryResponse, LltcategoryService } from './lltcategory.service';
import { CreateLltcategoryDto } from './dto/create-lltcategory.dto';
import { UpdateLltcategoryDto } from './dto/update-lltcategory.dto';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';

@ApiTags('admin-categories')
@Roles(Role.Admin)
@Controller('admin/categories')
export class LltcategoryController {
  constructor(private readonly lltcategoryService: LltcategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  create(
    @Body() dto: CreateLltcategoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AdminCategoryResponse> {
    return this.lltcategoryService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List categories with subcategories' })
  findAll(): Promise<AdminCategoryResponse[]> {
    return this.lltcategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminCategoryResponse> {
    return this.lltcategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltcategoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AdminCategoryResponse> {
    return this.lltcategoryService.update(id, dto, user.username);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    return this.lltcategoryService.remove(id);
  }
}
