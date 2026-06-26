import { Test, TestingModule } from '@nestjs/testing';
import { LltcategoryService } from './lltcategory.service';

describe('LltcategoryService', () => {
  let service: LltcategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcategoryService],
    }).compile();

    service = module.get<LltcategoryService>(LltcategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
