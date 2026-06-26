import { Injectable } from '@nestjs/common';

@Injectable()
export class LltcoursefileService {
  create(): string {
    return 'This action adds a new lltcoursefile';
  }

  findAll(): string {
    return `This action returns all lltcoursefile`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} lltcoursefile`;
  }

  update(id: number): string {
    return `This action updates a #${id} lltcoursefile`;
  }

  remove(id: number): string {
    return `This action removes a #${id} lltcoursefile`;
  }
}
