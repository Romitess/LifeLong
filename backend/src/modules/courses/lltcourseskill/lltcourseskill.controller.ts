import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { LltcourseskillService } from './lltcourseskill.service';

@ApiTags('skills')
@Controller('skills')
export class LltcourseskillController {
  constructor(private readonly lltcourseskillService: LltcourseskillService) {}

  @Get()
  @ApiOperation({ summary: 'Get all master skills' })
  findAllSkills(): Promise<{ id: number; label: string }[]> {
    return this.lltcourseskillService.findAllSkills();
  }

  @Get('user/:userId')
  @Roles(Role.Admin, Role.Instructor, Role.Student)
  @ApiOperation({ summary: 'Get user skill scores for dashboard' })
  getUserSkills(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    skills: { skillId: number; skillName: string; score: number }[];
  }> {
    // If the requesting user is fetching their own profile, pass their username to reliably resolve their profile ID.
    const username = userId === user.sub ? user.username : undefined;
    return this.lltcourseskillService.getUserSkills(userId, username);
  }

  @Post('recalculate/:userId')
  @Roles(Role.Admin, Role.Instructor)
  @ApiOperation({ summary: 'Recalculate user skills after course completion' })
  async recalculateUserSkills(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    await this.lltcourseskillService.recalculateUserSkills(userId, user.username);
    return { success: true };
  }
}
