import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursetargetService } from './lltcoursetarget.service';

describe('LltcoursetargetService', () => {
  let service: LltcoursetargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcoursetargetService],
    }).compile();

    service = module.get<LltcoursetargetService>(LltcoursetargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
