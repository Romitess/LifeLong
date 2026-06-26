import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LlttypestudyService } from './llttypestudy.service';
import { CreateLlttypestudyDto } from './dto/create-llttypestudy.dto';
import { UpdateLlttypestudyDto } from './dto/update-llttypestudy.dto';
import { Llttypestudy } from './entities/llttypestudy.entity';

@ApiTags('llttypestudy')
@Roles(Role.Admin)
@Controller('llttypestudy')
export class LlttypestudyController {
  constructor(private readonly llttypestudyService: LlttypestudyService) {}

  @Post()
  @ApiOperation({ summary: 'Create type study' })
  create(@Body() dto: CreateLlttypestudyDto): Promise<Llttypestudy> {
    return this.llttypestudyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all type studies' })
  findAll(): Promise<Llttypestudy[]> {
    return this.llttypestudyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get type study detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Llttypestudy> {
    return this.llttypestudyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update type study' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLlttypestudyDto,
  ): Promise<Llttypestudy> {
    return this.llttypestudyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete type study' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.llttypestudyService.remove(id);
  }
}
