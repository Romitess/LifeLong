import { Test, TestingModule } from '@nestjs/testing';
import { LltcourseskillService } from './lltcourseskill.service';

describe('LltcourseskillService', () => {
  let service: LltcourseskillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LltcourseskillService],
    }).compile();

    service = module.get<LltcourseskillService>(LltcourseskillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
