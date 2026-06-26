import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursetargetController } from './lltcoursetarget.controller';
import { LltcoursetargetService } from './lltcoursetarget.service';

describe('LltcoursetargetController', () => {
  let controller: LltcoursetargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcoursetargetController],
      providers: [LltcoursetargetService],
    }).compile();

    controller = module.get<LltcoursetargetController>(LltcoursetargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
