import { Test, TestingModule } from '@nestjs/testing';
import { LltchatService } from './lltchat.service';

describe('LltchatService', () => {
  let service: LltchatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltchatService],
    }).compile();

    service = module.get<LltchatService>(LltchatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
