import { Controller, Get } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { AdminSlideshowService } from './admin-slideshow.service';
import { HeroConfigResponseDto } from './dto/hero-config-response.dto';

@Controller('slideshow')
export class SlideshowPublicController {
  constructor(private readonly slideshowService: AdminSlideshowService) {}

  @Public()
  @Get()
  getActiveConfig(): Promise<HeroConfigResponseDto> {
    return this.slideshowService.getConfig();
  }
}
