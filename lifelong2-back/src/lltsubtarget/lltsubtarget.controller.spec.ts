import { Test, TestingModule } from '@nestjs/testing';
import { LltsubtargetController } from './lltsubtarget.controller';
import { LltsubtargetService } from './lltsubtarget.service';

describe('LltsubtargetController', () => {
  let controller: LltsubtargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltsubtargetController],
      providers: [LltsubtargetService],
    }).compile();

    controller = module.get<LltsubtargetController>(LltsubtargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
