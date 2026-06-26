import { Test, TestingModule } from '@nestjs/testing';
import { LltevaluationController } from './lltevaluation.controller';
import { LltevaluationService } from './lltevaluation.service';

describe('LltevaluationController', () => {
  let controller: LltevaluationController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltevaluationController],
      providers: [
        {
          provide: LltevaluationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LltevaluationController>(LltevaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
