import { Test, TestingModule } from '@nestjs/testing';
import { LltfacultyService } from './lltfaculty.service';

describe('LltfacultyService', () => {
  let service: LltfacultyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltfacultyService],
    }).compile();

    service = module.get<LltfacultyService>(LltfacultyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
