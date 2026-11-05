import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Teacher } from "../teachers/teacher.entity";
import { Student } from "src/students/student.entity";

@Entity('classes')
export class SchoolClass{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @Column({nullable:true})
    teacher_id: number;
    
    @ManyToOne(()=> Teacher, {onDelete: 'SET NULL', nullable:true})
    @JoinColumn({name: 'teacher_id'})
    teacher: Teacher;

    @OneToMany(()=>Student, student => student.schoolClass)
    students: Student[];
}