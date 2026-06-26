import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LlttargetService } from './llttarget.service';
import { CreateLlttargetDto } from './dto/create-llttarget.dto';
import { UpdateLlttargetDto } from './dto/update-llttarget.dto';
import { Llttarget } from './entities/llttarget.entity';

@ApiTags('llttarget')
@Roles(Role.Admin)
@Controller('llttarget')
export class LlttargetController {
  constructor(private readonly llttargetService: LlttargetService) {}

  @Post()
  @ApiOperation({ summary: 'Create course target' })
  create(@Body() dto: CreateLlttargetDto): Promise<Llttarget> {
    return this.llttargetService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all course targets' })
  findAll(): Promise<Llttarget[]> {
    return this.llttargetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course target detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Llttarget> {
    return this.llttargetService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course target' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLlttargetDto,
  ): Promise<Llttarget> {
    return this.llttargetService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course target' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.llttargetService.remove(id);
  }
}
