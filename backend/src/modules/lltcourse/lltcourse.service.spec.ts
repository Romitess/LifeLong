import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseService } from './lltcourse.service';

describe('LltcourseService', () => {
  let service: LltcourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcourseService],
    }).compile();

    service = module.get<LltcourseService>(LltcourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
