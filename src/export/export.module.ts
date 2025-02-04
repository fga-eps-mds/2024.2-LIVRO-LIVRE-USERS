import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UsersModule } from '../users/users.module';
import { BooksService } from './export.mockBooks';

@Module({
  imports: [UsersModule],
  controllers: [ExportController],
  providers: [ExportService, BooksService],
})
export class ExportModule {}
