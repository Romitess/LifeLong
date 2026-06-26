import { Test, TestingModule } from '@nestjs/testing';
import { LltumforgotpassService } from './lltumforgotpass.service';

describe('LltumforgotpassService', () => {
  let service: LltumforgotpassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltumforgotpassService],
    }).compile();

    service = module.get<LltumforgotpassService>(LltumforgotpassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
