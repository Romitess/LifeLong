import { Test, TestingModule } from '@nestjs/testing';
import { LltchatController } from './lltchat.controller';
import { LltchatService } from './lltchat.service';

describe('LltchatController', () => {
  let controller: LltchatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltchatController],
      providers: [LltchatService],
    }).compile();

    controller = module.get<LltchatController>(LltchatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
