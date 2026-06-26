import { Module } from '@nestjs/common';
import { PrivilegeService } from './privilege.service';
import { PrivilegeController } from './privilege.controller';
import { ManualUniversityDirectoryProvider } from './providers/manual-university-directory.provider';
import { UNIVERSITY_DIRECTORY } from './interfaces/university-directory.interface';

// To swap to MsgUniversityDirectoryProvider (Task 1C): change `useClass` here and add the new provider file.
@Module({
  controllers: [PrivilegeController],
  providers: [
    PrivilegeService,
    {
      provide: UNIVERSITY_DIRECTORY,
      useClass: ManualUniversityDirectoryProvider,
    },
  ],
})
export class PrivilegeModule {}
