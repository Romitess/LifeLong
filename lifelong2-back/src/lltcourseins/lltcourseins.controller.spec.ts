import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseinsController } from './lltcourseins.controller';
import { LltcourseinsService } from './lltcourseins.service';

describe('LltcourseinsController', () => {
  let controller: LltcourseinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcourseinsController],
      providers: [LltcourseinsService],
    }).compile();

    controller = module.get<LltcourseinsController>(LltcourseinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
