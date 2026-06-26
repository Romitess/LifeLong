import { Test, TestingModule } from '@nestjs/testing';
import { LltcertificatelogController } from './lltcertificatelog.controller';
import { LltcertificatelogService } from './lltcertificatelog.service';

describe('LltcertificatelogController', () => {
  let controller: LltcertificatelogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LltcertificatelogController],
      providers: [LltcertificatelogService],
    }).compile();

    controller = module.get<LltcertificatelogController>(LltcertificatelogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
