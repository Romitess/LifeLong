import { Test, TestingModule } from '@nestjs/testing';
import { LltumforgotpassController } from './lltumforgotpass.controller';
import { LltumforgotpassService } from './lltumforgotpass.service';

describe('LltumforgotpassController', () => {
  let controller: LltumforgotpassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltumforgotpassController],
      providers: [LltumforgotpassService],
    }).compile();

    controller = module.get<LltumforgotpassController>(LltumforgotpassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
