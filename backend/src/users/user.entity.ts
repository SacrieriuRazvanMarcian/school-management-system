import { Student } from 'src/students/student.entity';
import { Teacher } from 'src/teachers/teacher.entity';
import {Entity, PrimaryGeneratedColumn, Column, OneToOne} from 'typeorm';

export enum UserRole{
    ADMIN='ADMIN',
    STUDENT='STUDENT',
    TEACHER='TEACHER',
}

@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    email: string;

    @Column()
    password: string;

    @Column()
    role: UserRole;

    @OneToOne(() => Student, student => student.user)
    student: Student;

    @OneToOne(() => Teacher, teacher => teacher.user)
    teacher: Teacher;
}
 