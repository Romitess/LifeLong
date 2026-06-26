import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursetypeclassController } from './lltcoursetypeclass.controller';
import { LltcoursetypeclassService } from './lltcoursetypeclass.service';

describe('LltcoursetypeclassController', () => {
  let controller: LltcoursetypeclassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcoursetypeclassController],
      providers: [LltcoursetypeclassService],
    }).compile();

    controller = module.get<LltcoursetypeclassController>(LltcoursetypeclassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
