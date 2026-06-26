import { Test, TestingModule } from '@nestjs/testing';
import { LltsubtargetService } from './lltsubtarget.service';

describe('LltsubtargetService', () => {
  let service: LltsubtargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltsubtargetService],
    }).compile();

    service = module.get<LltsubtargetService>(LltsubtargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
