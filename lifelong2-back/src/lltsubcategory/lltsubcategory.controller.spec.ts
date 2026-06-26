import { Test, TestingModule } from '@nestjs/testing';
import { LltsubcategoryController } from './lltsubcategory.controller';
import { LltsubcategoryService } from './lltsubcategory.service';

describe('LltsubcategoryController', () => {
  let controller: LltsubcategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltsubcategoryController],
      providers: [LltsubcategoryService],
    }).compile();

    controller = module.get<LltsubcategoryController>(LltsubcategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
