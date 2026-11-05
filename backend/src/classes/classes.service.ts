import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClass } from './class.entity';
import { CreateClassDto, UpdateClassDto } from './create-class.dto';
import { JwtPayload } from 'src/auth/auth.interfaces';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class ClassesService {
    constructor(
        @InjectRepository(SchoolClass) 
        private classesRepository: Repository<SchoolClass>,
    ){}
    
    async create(createClassDto:CreateClassDto):Promise<SchoolClass>{
        return await this.classesRepository.save(createClassDto);
    }

    async findAll(){
        return await this.classesRepository.find({
            relations:{
                teacher:true,
                students:true,
            }
        });
    }

    async findOne(id:number,currentUser:JwtPayload){
        const classEntity = await this.classesRepository.findOne({
            where:{id},
            relations:{
                teacher:true,
                students:true,
            }
        });
        if(!classEntity){
            throw new NotFoundException(`Classroom with id ${id} not found.`);
        }
        if(currentUser.role === UserRole.TEACHER && classEntity.teacher_id!==currentUser.sub)
        {
            throw new ForbiddenException(`You're not assigned to this class.`);
        }
        return classEntity;
    }

    async update(id:number,updateClassDto:UpdateClassDto){
        const studentClass = await this.classesRepository.preload({
            id,
            ...updateClassDto,
        });
        if(!studentClass){
            throw new NotFoundException(`Class with id ${id} not found.`);
        }
        return await this.classesRepository.save(studentClass);
    }

    async remove(id:number){
        const rez = await this.classesRepository.delete(id);
        if(rez.affected===0){
            throw new NotFoundException(`Class with id ${id} doesn't exist`);
        }
        return {message:`Class with id ${id} was removed.`};
    }

}
