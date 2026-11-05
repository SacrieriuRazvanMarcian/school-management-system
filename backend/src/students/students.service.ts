import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { CreateStudentDto, UpdateStudentDto } from './create-student.dto';
import { JwtPayload } from 'src/auth/auth.interfaces';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
    ){}
    async create(createStudentDto:CreateStudentDto):Promise<Student>{
        return await this.studentRepository.save(createStudentDto); 
    }
    async findAll(){
        return await this.studentRepository.find({
                relations:{
                user:true,
                schoolClass:true,
                }
        });
    }
    async findOne(id:number, currentUser:JwtPayload){
        const student = await this.studentRepository.findOne({
            where:{user_id:id},
            relations:{
                user:true,
                schoolClass:true,
            }
        });
        if(!student){
            throw new NotFoundException(`Student with id ${id} not found.`);
        }
        if(currentUser.role===UserRole.STUDENT && currentUser.sub!==student.user_id){
            throw new ForbiddenException(`You don't have access.`);
        }
        if(currentUser.role===UserRole.TEACHER){
            if(!student.schoolClass || student.schoolClass.teacher_id!==currentUser.sub){
                throw new ForbiddenException(`Not allowed to view data of students outside your class.`);
            }
        }
        return student;
    }
    async remove(id:number){
        const result = await this.studentRepository.delete(id);
        if(result.affected===0){
            throw new NotFoundException(`Student with id ${id} doesn't exist.`);
        }
        return {message:`Student with id ${id} was removed.`};
    }
    async update(id:number, updateStudentDto:UpdateStudentDto) {
        const student = await this.studentRepository.preload({
            user_id:id,
            ...updateStudentDto,
        });
        if(!student){
            throw new NotFoundException(`Student with id ${id} not found.`);
        }
        return await this.studentRepository.save(student);

    }
}
