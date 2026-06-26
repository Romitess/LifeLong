import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Course Creation (POC)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new course (POST /api/moodle/courses)', async () => {
    const payload = {
      fullname: 'การเขียนโปรแกรม Python เบื้องต้น',
      shortname: 'PY101',
      categoryid: '1',
      summary: 'คอร์สเรียนรู้พื้นฐานภาษา Python สำหรับบุคคลทั่วไป',
      titleEn: 'Introduction to Python Programming',
      hours: '15',
      startDate: '2026-06-01',
      endDate: '2026-07-01',
    };

    // ระบุ Type ให้กับ response body เพื่อเลี่ยง unsafe member access
    interface CourseResponse {
      shortname: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/api/moodle/courses')
      .field('fullname', payload.fullname)
      .field('shortname', payload.shortname)
      .field('categoryid', payload.categoryid)
      .field('summary', payload.summary)
      .field('titleEn', payload.titleEn)
      .field('hours', payload.hours)
      .field('startDate', payload.startDate)
      .field('endDate', payload.endDate)
      .expect(201);

    const body = response.body as CourseResponse;
    expect(body).toBeDefined();
    expect(body.shortname).toBe(payload.shortname);
  });
});
