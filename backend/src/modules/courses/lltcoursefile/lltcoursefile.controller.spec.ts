import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursefileController } from './lltcoursefile.controller';
import { LltcoursefileService } from './lltcoursefile.service';

describe('LltcoursefileController', () => {
  let controller: LltcoursefileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcoursefileController],
      providers: [LltcoursefileService],
    }).compile();

    controller = module.get<LltcoursefileController>(LltcoursefileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
