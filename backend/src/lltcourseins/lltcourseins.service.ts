import { Injectable } from '@nestjs/common';

@Injectable()
export class LltcourseinsService {
  create(): string {
    return 'This action adds a new lltcoursein';
  }

  findAll(): string {
    return `This action returns all lltcourseins`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} lltcoursein`;
  }

  update(id: number): string {
    return `This action updates a #${id} lltcoursein`;
  }

  remove(id: number): string {
    return `This action removes a #${id} lltcoursein`;
  }
}
