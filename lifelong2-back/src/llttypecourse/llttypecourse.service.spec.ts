import { Test, TestingModule } from '@nestjs/testing';
import { LlttypecourseService } from './llttypecourse.service';

describe('LlttypecourseService', () => {
  let service: LlttypecourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlttypecourseService],
    }).compile();

    service = module.get<LlttypecourseService>(LlttypecourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
