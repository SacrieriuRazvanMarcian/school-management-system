import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { GradesModule } from './grades/grades.module';
import { AuthModule } from './auth/auth.module';
import { SeedService } from './seed.service';
import { SchoolClass } from './classes/class.entity';
import { Grade } from './grades/grade.entity';
import { Student } from './students/student.entity';
import { Teacher } from './teachers/teacher.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService:ConfigService)=>({
      type:'postgres',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      }),
    }),
    TypeOrmModule.forFeature([SchoolClass, Grade, Student, Teacher,User]),
    UsersModule,
    TeachersModule,
    ClassesModule,
    StudentsModule,
    GradesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,SeedService],
})
export class AppModule {}
