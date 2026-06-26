import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursetypeclassService } from './lltcoursetypeclass.service';

describe('LltcoursetypeclassService', () => {
  let service: LltcoursetypeclassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcoursetypeclassService],
    }).compile();

    service = module.get<LltcoursetypeclassService>(LltcoursetypeclassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
