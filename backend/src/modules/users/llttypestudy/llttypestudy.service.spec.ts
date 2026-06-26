import { Test, TestingModule } from '@nestjs/testing';
import { LlttypestudyService } from './llttypestudy.service';

describe('LlttypestudyService', () => {
  let service: LlttypestudyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlttypestudyService],
    }).compile();

    service = module.get<LlttypestudyService>(LlttypestudyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
