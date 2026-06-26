import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { Role } from '../../auth/enums/role.enum';
import { LltcoursetypeclassService } from './lltcoursetypeclass.service';
import { CreateLltcoursetypeclassDto } from './dto/create-lltcoursetypeclass.dto';
import { UpdateLltcoursetypeclassDto } from './dto/update-lltcoursetypeclass.dto';
import { Lltcoursetypeclass } from './entities/lltcoursetypeclass.entity';

@ApiTags('lltcoursetypeclass')
@Controller('lltcoursetypeclass')
export class LltcoursetypeclassController {
  constructor(private readonly service: LltcoursetypeclassService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create course typeclass mapping' })
  create(
    @Body() dto: CreateLltcoursetypeclassDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursetypeclass> {
    return this.service.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List all course typeclass mappings' })
  findAll(): Promise<Lltcoursetypeclass[]> {
    return this.service.findAll();
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get typeclass mappings for a specific course' })
  findByCourseId(@Param('courseId', ParseIntPipe) courseId: number): Promise<Lltcoursetypeclass[]> {
    return this.service.findByCourseId(courseId);
  }

  @Get(':courseId/:typeclassId')
  @ApiOperation({ summary: 'Get a specific course typeclass mapping' })
  findOne(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('typeclassId', ParseIntPipe) typeclassId: number,
  ): Promise<Lltcoursetypeclass> {
    return this.service.findOne(courseId, typeclassId);
  }

  @Roles(Role.Admin)
  @Patch(':courseId/:typeclassId')
  @ApiOperation({ summary: 'Update a specific course typeclass mapping' })
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('typeclassId', ParseIntPipe) typeclassId: number,
    @Body() dto: UpdateLltcoursetypeclassDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursetypeclass> {
    return this.service.update(courseId, typeclassId, dto, user.username);
  }

  @Roles(Role.Admin)
  @Delete(':courseId/:typeclassId')
  @ApiOperation({ summary: 'Delete a specific course typeclass mapping' })
  remove(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('typeclassId', ParseIntPipe) typeclassId: number,
  ): Promise<{ success: boolean }> {
    return this.service.remove(courseId, typeclassId);
  }
}
