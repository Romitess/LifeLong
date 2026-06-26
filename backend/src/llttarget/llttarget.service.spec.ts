import { Test, TestingModule } from '@nestjs/testing';
import { LlttargetService } from './llttarget.service';

describe('LlttargetService', () => {
  let service: LlttargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlttargetService],
    }).compile();

    service = module.get<LlttargetService>(LlttargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
