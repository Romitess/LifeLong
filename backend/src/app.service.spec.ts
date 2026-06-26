import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('returns health status', () => {
    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'lifelong2-back',
    });
  });
});
