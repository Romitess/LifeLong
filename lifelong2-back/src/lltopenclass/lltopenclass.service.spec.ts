import { Test, TestingModule } from '@nestjs/testing';
import { LltopenclassService } from './lltopenclass.service';

describe('LltopenclassService', () => {
  let service: LltopenclassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltopenclassService],
    }).compile();

    service = module.get<LltopenclassService>(LltopenclassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
