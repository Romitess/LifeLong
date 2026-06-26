import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseinsService } from './lltcourseins.service';

describe('LltcourseinsService', () => {
  let service: LltcourseinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcourseinsService],
    }).compile();

    service = module.get<LltcourseinsService>(LltcourseinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
