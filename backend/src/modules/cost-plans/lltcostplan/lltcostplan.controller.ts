import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LltcostplanService } from './lltcostplan.service';
import { CreateLltcostplanDto } from './dto/create-lltcostplan.dto';
import { UpdateLltcostplanDto } from './dto/update-lltcostplan.dto';
import { Lltcostplan } from './entities/lltcostplan.entity';
import { Role } from 'src/modules/auth/enums/role.enum';
import { Roles } from 'src/modules/auth/roles.decorator';

@ApiTags('lltcostplan')
@Roles(Role.Admin, Role.Finance, Role.CentralFinance)
@Controller('lltcostplan')
export class LltcostplanController {
  constructor(private readonly lltcostplanService: LltcostplanService) {}

  @Post()
  @ApiOperation({ summary: 'Create cost plan' })
  create(@Body() dto: CreateLltcostplanDto, @CurrentUser() user: JwtPayload): Promise<Lltcostplan> {
    return this.lltcostplanService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List all cost plans' })
  findAll(): Promise<Lltcostplan[]> {
    return this.lltcostplanService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cost plan detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltcostplan> {
    return this.lltcostplanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cost plan' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltcostplanDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcostplan> {
    return this.lltcostplanService.update(id, dto, user.username);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cost plan' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.lltcostplanService.remove(id);
  }
}
