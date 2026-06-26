import { Injectable } from '@nestjs/common';

@Injectable()
export class LlttypecourseService {
  create(): string {
    return 'This action adds a new llttypecourse';
  }

  findAll(): string {
    return `This action returns all llttypecourse`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} llttypecourse`;
  }

  update(id: number): string {
    return `This action updates a #${id} llttypecourse`;
  }

  remove(id: number): string {
    return `This action removes a #${id} llttypecourse`;
  }
}
