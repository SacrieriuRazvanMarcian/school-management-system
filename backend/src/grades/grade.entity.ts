import { Student } from "src/students/student.entity";
import { Teacher } from "src/teachers/teacher.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity('grades')
export class Grade{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    value:number;

    @Column()
    subject: string;

    @Column({type:'date'})
    date: Date;

    @Column()
    student_id:number;

    @ManyToOne(()=>Student,{onDelete:'RESTRICT'})
    @JoinColumn({name:'student_id'})
    student: Student;

    @Column({nullable:true})
    teacher_id:number;

    @ManyToOne(()=>Teacher,{onDelete:'SET NULL',nullable:true})
    @JoinColumn({name:'teacher_id'})
    teacher: Teacher;
}