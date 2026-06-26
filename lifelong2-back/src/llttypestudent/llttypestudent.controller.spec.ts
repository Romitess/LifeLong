import { Test, TestingModule } from '@nestjs/testing';
import { LlttypestudentController } from './llttypestudent.controller';
import { LlttypestudentService } from './llttypestudent.service';

describe('LlttypestudentController', () => {
  let controller: LlttypestudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlttypestudentController],
      providers: [LlttypestudentService],
    }).compile();

    controller = module.get<LlttypestudentController>(LlttypestudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
