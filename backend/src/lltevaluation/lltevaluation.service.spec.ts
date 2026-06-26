import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LltevaluationService } from './lltevaluation.service';
import { Lltevaluation } from './entities/lltevaluation.entity';

describe('LltevaluationService', () => {
  let service: LltevaluationService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LltevaluationService,
        {
          provide: getRepositoryToken(Lltevaluation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LltevaluationService>(LltevaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
