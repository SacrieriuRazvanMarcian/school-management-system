import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { Repository } from 'typeorm';
import { CreateTeacherDto, UpdateTeacherDto } from './create-teacher.dto';

@Injectable()
export class TeachersService {
    constructor(
        @InjectRepository(Teacher)
        private teacherRepository: Repository <Teacher>,
    ){}
    async create(createTeacherDto:CreateTeacherDto): Promise<Teacher>{
        return await this.teacherRepository.save(createTeacherDto);
    }
    async findAll(){
        return await this.teacherRepository.find({
            relations:{
                user:true,
            }
        });
    }
    async findOne(id:number){
        const teacher = await this.teacherRepository.findOne({
            where:{user_id:id},
            relations:{
                user:true,
            }
        });
        if(!teacher){
            throw new NotFoundException(`Teacher with id ${id} not found.`);
        }
        return teacher;
    }
        async remove(id:number){
            const result = await this.teacherRepository.delete(id);
            if(result.affected===0){
                throw new NotFoundException(`Teacher with id ${id} doesn't exist.`);
            }
            return {message:`Teacher with id ${id} was removed.`};
        }
        async update(id:number, updateTeacherDto:UpdateTeacherDto) {
            const teacher = await this.teacherRepository.preload({
                user_id:id,
                ...updateTeacherDto,
            });
            if(!teacher){
                throw new NotFoundException(`Teacher with id ${id} not found.`);
            }
            return await this.teacherRepository.save(teacher);
    
        }
}
