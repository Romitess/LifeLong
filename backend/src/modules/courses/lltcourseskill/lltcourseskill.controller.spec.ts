import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseskillController } from './lltcourseskill.controller';
import { LltcourseskillService } from './lltcourseskill.service';

describe('LltcourseskillController', () => {
  let controller: LltcourseskillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcourseskillController],
      providers: [LltcourseskillService],
    }).compile();

    controller = module.get<LltcourseskillController>(LltcourseskillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
