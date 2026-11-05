import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { SchoolClass } from './class.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([SchoolClass])],
  controllers: [ClassesController],
  providers: [ClassesService]
})
export class ClassesModule {}
