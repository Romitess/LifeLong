import { Test, TestingModule } from '@nestjs/testing';
import { LltcertificatelogService } from './lltcertificatelog.service';

describe('LltcertificatelogService', () => {
  let service: LltcertificatelogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcertificatelogService],
    }).compile();

    service = module.get<LltcertificatelogService>(LltcertificatelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
