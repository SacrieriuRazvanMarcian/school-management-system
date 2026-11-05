import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'
import { Student } from 'src/students/student.entity';
import { Teacher } from 'src/teachers/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Student,Teacher])],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
