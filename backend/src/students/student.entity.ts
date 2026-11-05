import { SchoolClass } from "src/classes/class.entity";
import { User } from "src/users/user.entity";
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";

@Entity('students')
export class Student
{
    @PrimaryColumn()
    user_id:number;

    @OneToOne(()=>User,user => user.student, {onDelete:'CASCADE'})
    @JoinColumn({name:'user_id'})
    user:User

    @Column()
    first_name:string;

    @Column()
    last_name:string;

    @Column({type:'date'})
    date_of_birth: Date;

    @Column({nullable:true})
    class_id:number

    @ManyToOne(()=>SchoolClass, schoolClass => schoolClass.students, {onDelete:'SET NULL',nullable:true})
    @JoinColumn({name:'class_id'})
    schoolClass: SchoolClass;

}