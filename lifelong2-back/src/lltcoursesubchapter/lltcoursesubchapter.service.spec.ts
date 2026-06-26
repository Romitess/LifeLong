import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursesubchapterService } from './lltcoursesubchapter.service';

describe('LltcoursesubchapterService', () => {
  let service: LltcoursesubchapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcoursesubchapterService],
    }).compile();

    service = module.get<LltcoursesubchapterService>(LltcoursesubchapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
