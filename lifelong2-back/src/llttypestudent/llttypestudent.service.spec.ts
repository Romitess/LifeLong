import { Test, TestingModule } from '@nestjs/testing';
import { LlttypestudentService } from './llttypestudent.service';

describe('LlttypestudentService', () => {
  let service: LlttypestudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlttypestudentService],
    }).compile();

    service = module.get<LlttypestudentService>(LlttypestudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
