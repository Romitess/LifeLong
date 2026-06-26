import { Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { LlttypecourseService } from './llttypecourse.service';

@Roles(Role.Admin)
@Controller('llttypecourse')
export class LlttypecourseController {
  constructor(private readonly llttypecourseService: LlttypecourseService) {}

  @Post()
  create(): string {
    return this.llttypecourseService.create();
  }

  @Get()
  findAll(): string {
    return this.llttypecourseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.llttypecourseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string): string {
    return this.llttypecourseService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.llttypecourseService.remove(+id);
  }
}
