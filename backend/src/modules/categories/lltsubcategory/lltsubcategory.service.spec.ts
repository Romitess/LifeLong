import { Test, TestingModule } from '@nestjs/testing';
import { LltsubcategoryService } from './lltsubcategory.service';

describe('LltsubcategoryService', () => {
  let service: LltsubcategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltsubcategoryService],
    }).compile();

    service = module.get<LltsubcategoryService>(LltsubcategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
