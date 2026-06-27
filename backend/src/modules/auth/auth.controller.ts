import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { Role } from './enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Req() req: Request): ReturnType<AuthService['login']> {
    return this.authService.login(loginDto, req);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): ReturnType<AuthService['register']> {
    return this.authService.register(registerDto);
  }

  /**
   * Admin-only maintenance: create/link Moodle accounts for LLT users missing an
   * LMS_ID. Idempotent and batched — call repeatedly until `remaining` is 0.
   */
  @Roles(Role.Admin)
  @Post('moodle-backfill')
  @HttpCode(HttpStatus.OK)
  backfillMoodle(@Query('limit') limit?: string): ReturnType<AuthService['backfillMoodleUsers']> {
    const parsed = Number(limit);
    return this.authService.backfillMoodleUsers(
      Number.isFinite(parsed) && parsed > 0 ? parsed : 100,
    );
  }
}
