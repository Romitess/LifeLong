import { Test, TestingModule } from '@nestjs/testing';
import { LlttypecourseController } from './llttypecourse.controller';
import { LlttypecourseService } from './llttypecourse.service';

describe('LlttypecourseController', () => {
  let controller: LlttypecourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlttypecourseController],
      providers: [LlttypecourseService],
    }).compile();

    controller = module.get<LlttypecourseController>(LlttypecourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
