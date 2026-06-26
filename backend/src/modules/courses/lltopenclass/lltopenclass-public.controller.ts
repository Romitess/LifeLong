import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LltopenclassService, OpenclassItem, PaginatedOpenclass } from './lltopenclass.service';
import { QueryLltopenclassDto } from './dto/query-lltopenclass.dto';

@ApiTags('openclasses')
@Controller('openclasses')
export class LltopenclassPublicController {
  constructor(private readonly lltopenclassService: LltopenclassService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public open classes' })
  findAll(@Query() query: QueryLltopenclassDto): Promise<PaginatedOpenclass> {
    return this.lltopenclassService.findAll({ ...query, isPublic: 'Y' });
  }

  @Roles(Role.Student, Role.Admin)
  @Get('course/:courseId')
  @ApiOperation({ summary: 'List all open classes for a course (authenticated)' })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number): Promise<OpenclassItem[]> {
    return this.lltopenclassService.findByCourse(courseId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get open class detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OpenclassItem> {
    return this.lltopenclassService.findOne(id);
  }
}
