import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursechapterController } from './lltcoursechapter.controller';
import { LltcoursechapterService } from './lltcoursechapter.service';

describe('LltcoursechapterController', () => {
  let controller: LltcoursechapterController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByCourseId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcoursechapterController],
      providers: [
        {
          provide: LltcoursechapterService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LltcoursechapterController>(LltcoursechapterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
