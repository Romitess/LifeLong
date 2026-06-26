import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursesubchapterController } from './lltcoursesubchapter.controller';
import { LltcoursesubchapterService } from './lltcoursesubchapter.service';

describe('LltcoursesubchapterController', () => {
  let controller: LltcoursesubchapterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcoursesubchapterController],
      providers: [LltcoursesubchapterService],
    }).compile();

    controller = module.get<LltcoursesubchapterController>(LltcoursesubchapterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
