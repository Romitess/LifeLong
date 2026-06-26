import { Test, TestingModule } from '@nestjs/testing';
import { LlttargetController } from './llttarget.controller';
import { LlttargetService } from './llttarget.service';

describe('LlttargetController', () => {
  let controller: LlttargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlttargetController],
      providers: [LlttargetService],
    }).compile();

    controller = module.get<LlttargetController>(LlttargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
