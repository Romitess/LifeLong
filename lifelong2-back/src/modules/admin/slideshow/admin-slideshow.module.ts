import { Module } from '@nestjs/common';
import { AdminSlideshowController } from './admin-slideshow.controller';
import { SlideshowPublicController } from './slideshow-public.controller';
import { AdminSlideshowService } from './admin-slideshow.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminSlideshowController, SlideshowPublicController],
  providers: [AdminSlideshowService],
})
export class AdminSlideshowModule {}
