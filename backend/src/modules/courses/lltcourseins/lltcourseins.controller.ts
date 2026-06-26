import { Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LltcourseinsService } from './lltcourseins.service';

@Roles(Role.Admin)
@Controller('lltcourseins')
export class LltcourseinsController {
  constructor(private readonly lltcourseinsService: LltcourseinsService) {}

  @Post()
  create(): string {
    return this.lltcourseinsService.create();
  }

  @Get()
  findAll(): string {
    return this.lltcourseinsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.lltcourseinsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string): string {
    return this.lltcourseinsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.lltcourseinsService.remove(+id);
  }
}
