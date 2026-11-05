import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "../users/user.entity";
import { SchoolClass } from "src/classes/class.entity";

@Entity('teachers')
export class Teacher{
    @PrimaryColumn()
    user_id:number;
    
    @OneToOne(()=> User, user => user.teacher, {onDelete: 'CASCADE'})
    @JoinColumn({name:'user_id'})
    user: User;

    @Column()
    first_name:string;

    @Column()
    last_name:string;

    @OneToMany(()=>SchoolClass, schoolClass=>schoolClass.teacher)
    classes: SchoolClass[];
}