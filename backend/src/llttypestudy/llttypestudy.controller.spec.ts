import { Test, TestingModule } from '@nestjs/testing';
import { LlttypestudyController } from './llttypestudy.controller';
import { LlttypestudyService } from './llttypestudy.service';

describe('LlttypestudyController', () => {
  let controller: LlttypestudyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlttypestudyController],
      providers: [LlttypestudyService],
    }).compile();

    controller = module.get<LlttypestudyController>(LlttypestudyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
