import { Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LltcoursefileService } from './lltcoursefile.service';

@Roles(Role.Admin)
@Controller('lltcoursefile')
export class LltcoursefileController {
  constructor(private readonly lltcoursefileService: LltcoursefileService) {}

  @Post()
  create(): string {
    return this.lltcoursefileService.create();
  }

  @Get()
  findAll(): string {
    return this.lltcoursefileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.lltcoursefileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string): string {
    return this.lltcoursefileService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.lltcoursefileService.remove(+id);
  }
}
