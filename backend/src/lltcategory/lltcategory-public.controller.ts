import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/public.decorator';
import { LltcategoryService, PublicCategoryResponse } from './lltcategory.service';

@ApiTags('categories')
@Controller('categories')
export class LltcategoryPublicController {
  constructor(private readonly lltcategoryService: LltcategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active categories for frontend navigation' })
  findActive(): Promise<PublicCategoryResponse[]> {
    return this.lltcategoryService.findActiveForPublic();
  }
}
