import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseController } from './lltcourse.controller';
import { LltcourseService } from './lltcourse.service';

describe('LltcourseController', () => {
  let controller: LltcourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcourseController],
      providers: [LltcourseService],
    }).compile();

    controller = module.get<LltcourseController>(LltcourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
