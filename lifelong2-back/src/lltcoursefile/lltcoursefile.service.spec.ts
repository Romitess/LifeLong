import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursefileService } from './lltcoursefile.service';

describe('LltcoursefileService', () => {
  let service: LltcoursefileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcoursefileService],
    }).compile();

    service = module.get<LltcoursefileService>(LltcoursefileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
