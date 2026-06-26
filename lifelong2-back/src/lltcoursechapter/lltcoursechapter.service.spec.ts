import { Test, TestingModule } from '@nestjs/testing';
import { LltcoursechapterService } from './lltcoursechapter.service';

describe('LltcoursechapterService', () => {
  let service: LltcoursechapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcoursechapterService],
    }).compile();

    service = module.get<LltcoursechapterService>(LltcoursechapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
