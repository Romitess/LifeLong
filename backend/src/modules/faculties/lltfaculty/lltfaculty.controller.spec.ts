import { Test, TestingModule } from '@nestjs/testing';
import { LltfacultyController } from './lltfaculty.controller';
import { LltfacultyService } from './lltfaculty.service';

describe('LltfacultyController', () => {
  let controller: LltfacultyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltfacultyController],
      providers: [LltfacultyService],
    }).compile();

    controller = module.get<LltfacultyController>(LltfacultyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
