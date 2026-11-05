import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from 'src/users/user.entity'; 
import { SchoolClass } from 'src/classes/class.entity'; 
import { Grade } from 'src/grades/grade.entity';
import { Student } from 'src/students/student.entity';
import { Teacher } from 'src/teachers/teacher.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(SchoolClass) private classRepository: Repository<SchoolClass>,
        @InjectRepository(Grade) private gradeRepository: Repository<Grade>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    ) {}

    async onApplicationBootstrap() {
        const users = await this.userRepository.find();
        
        if (users.length > 0) {
            return;
        }

        console.log('Seeding initial data with full infrastructure...');
        
        const hashedPassword = await bcrypt.hash('Password1!', 10);

        await this.userRepository.save(
            this.userRepository.create({
                email: 'admin@school.com',
                password: hashedPassword, 
                role: UserRole.ADMIN,
            })
        );

        const teacherUser = await this.userRepository.save(
            this.userRepository.create({
                email: 'teacher@school.com',
                password: hashedPassword,
                role: UserRole.TEACHER,
            })
        );
        
        await this.teacherRepository.save(
            this.teacherRepository.create({
                user_id: teacherUser.id,
                first_name: 'Grigore', 
                last_name: 'Moisil'
            })
        );

        const schoolClass = await this.classRepository.save(
            this.classRepository.create({
                name: '10A',
                teacher_id: teacherUser.id,
            })
        );

        const studentUser = await this.userRepository.save(
            this.userRepository.create({
                email: 'student@school.com',
                password: hashedPassword,
                role: UserRole.STUDENT,
            })
        );
        
        await this.studentRepository.save(
            this.studentRepository.create({
                user_id: studentUser.id,
                first_name: 'Ion', 
                last_name: 'Popescu', 
                date_of_birth: '2010-05-15',
                class_id: schoolClass.id
            })
        );

        await this.gradeRepository.save([
            this.gradeRepository.create({
                value: 9,
                subject: 'Math',
                date: '2026-10-10',
                student_id: studentUser.id,
                teacher_id: teacherUser.id,
            }),
            this.gradeRepository.create({
                value: 10,
                subject: 'Math',
                date: '2026-10-15',
                student_id: studentUser.id,
                teacher_id: teacherUser.id,
            }),
            this.gradeRepository.create({
                value: 8,
                subject: 'English',
                date: '2026-10-12',
                student_id: studentUser.id,
                teacher_id: teacherUser.id,
            })
        ]);

        console.log('Seeding complete. Users, classes, and grades successfully generated!');
    }
}