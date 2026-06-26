import { Test, TestingModule } from '@nestjs/testing';
import { LltopenclassController } from './lltopenclass.controller';
import { LltopenclassService } from './lltopenclass.service';

describe('LltopenclassController', () => {
  let controller: LltopenclassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltopenclassController],
      providers: [LltopenclassService],
    }).compile();

    controller = module.get<LltopenclassController>(LltopenclassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
