import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { LlttypestudentService } from './llttypestudent.service';
import { CreateLlttypestudentDto } from './dto/create-llttypestudent.dto';
import { UpdateLlttypestudentDto } from './dto/update-llttypestudent.dto';
import { Llttypestudent } from './entities/llttypestudent.entity';

@ApiTags('llttypestudent')
@Roles(Role.Admin)
@Controller('llttypestudent')
export class LlttypestudentController {
  constructor(private readonly llttypestudentService: LlttypestudentService) {}

  @Post()
  @ApiOperation({ summary: 'Create student type' })
  create(@Body() createLlttypestudentDto: CreateLlttypestudentDto): Promise<Llttypestudent> {
    return this.llttypestudentService.create(createLlttypestudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all student types' })
  findAll(): Promise<Llttypestudent[]> {
    return this.llttypestudentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student type detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Llttypestudent> {
    return this.llttypestudentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student type' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLlttypestudentDto: UpdateLlttypestudentDto,
  ): Promise<Llttypestudent> {
    return this.llttypestudentService.update(id, updateLlttypestudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student type' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.llttypestudentService.remove(id);
  }
}
