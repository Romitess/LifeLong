import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LltevaluationService } from './lltevaluation.service';
import { CreateLltevaluationDto } from './dto/create-lltevaluation.dto';
import { UpdateLltevaluationDto } from './dto/update-lltevaluation.dto';
import { Lltevaluation } from './entities/lltevaluation.entity';

@ApiTags('lltevaluation')
@Roles(Role.Admin)
@Controller('lltevaluation')
export class LltevaluationController {
  constructor(private readonly lltevaluationService: LltevaluationService) {}

  @Post()
  @ApiOperation({ summary: 'Create evaluation' })
  create(@Body() createLltevaluationDto: CreateLltevaluationDto): Promise<Lltevaluation> {
    return this.lltevaluationService.create(createLltevaluationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List evaluations' })
  findAll(): Promise<Lltevaluation[]> {
    return this.lltevaluationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltevaluation> {
    return this.lltevaluationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update evaluation' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLltevaluationDto: UpdateLltevaluationDto,
  ): Promise<Lltevaluation> {
    return this.lltevaluationService.update(id, updateLltevaluationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete evaluation' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.lltevaluationService.remove(id);
  }
}
