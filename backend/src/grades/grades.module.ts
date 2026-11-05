import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './grade.entity';
import { Student } from '../students/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade,Student])],
  controllers: [GradesController],
  providers: [GradesService]
})
export class GradesModule {}
