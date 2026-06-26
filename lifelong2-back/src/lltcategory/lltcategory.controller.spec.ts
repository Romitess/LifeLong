import { Test, TestingModule } from '@nestjs/testing';
import { LltcategoryController } from './lltcategory.controller';
import { LltcategoryService } from './lltcategory.service';

describe('LltcategoryController', () => {
  let controller: LltcategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcategoryController],
      providers: [LltcategoryService],
    }).compile();

    controller = module.get<LltcategoryController>(LltcategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
