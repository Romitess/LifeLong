import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { LltopenclassService, OpenclassItem, PaginatedOpenclass } from './lltopenclass.service';
import { CreateLltopenclassDto } from './dto/create-lltopenclass.dto';
import { UpdateLltopenclassDto } from './dto/update-lltopenclass.dto';
import { QueryLltopenclassDto } from './dto/query-lltopenclass.dto';

@ApiTags('admin-openclasses')
@Roles(Role.Admin)
@Controller('admin/openclasses')
export class LltopenclassController {
  constructor(private readonly lltopenclassService: LltopenclassService) {}

  @Post()
  @ApiOperation({ summary: 'Create open class' })
  create(
    @Body() dto: CreateLltopenclassDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OpenclassItem> {
    return this.lltopenclassService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List open classes with pagination and filters' })
  findAll(@Query() query: QueryLltopenclassDto): Promise<PaginatedOpenclass> {
    return this.lltopenclassService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get open class by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OpenclassItem> {
    return this.lltopenclassService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update open class' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltopenclassDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OpenclassItem> {
    return this.lltopenclassService.update(id, dto, user.username);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete open class' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    return this.lltopenclassService.remove(id);
  }
}
