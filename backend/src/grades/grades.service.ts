import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Grade } from './grade.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGradeDto, UpdateGradesDto } from './create-grade.dto';
import { JwtPayload } from 'src/auth/auth.interfaces';
import { UserRole } from 'src/users/user.entity';
import { Student } from 'src/students/student.entity';

@Injectable()
export class GradesService {
    constructor(
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
    ){}
    
    async create(createGradeDto:CreateGradeDto,user:JwtPayload): Promise<Grade>{
        if(user.role === UserRole.TEACHER){
            const student = await this.studentRepository.findOne({
                where: {user_id: createGradeDto.student_id},
                relations:{schoolClass:true},
            });
            if (!student || !student.schoolClass || student.schoolClass.teacher_id !== user.sub) {
                throw new ForbiddenException('You can only grade students in your assigned classes.');
            }
            createGradeDto.teacher_id = user.sub;
        }
        return await this.gradeRepository.save(createGradeDto);
    }

    async findAll(user:JwtPayload){
        if(user.role==UserRole.STUDENT){
            const grades= await this.gradeRepository.find({
                where:{student: {user_id:user.sub}},
                relations:{student:true}
            });
            let average=0;
            if(grades.length>0){
                const sum=grades.reduce((acc,curr)=>acc+curr.value,0);
                average=sum/grades.length;
            }
            return{
                average:parseFloat(average.toFixed(2)),
                grades:grades,
            };
        }
        if(user.role===UserRole.TEACHER){
            return await this.gradeRepository.find({
                where:{student:{schoolClass:{teacher_id:user.sub}}},
                relations:{student:true},
            });
        }
        return await this.gradeRepository.find({
            relations:{
                student:true,
                teacher:true,
            }
        });
    }
    async findByStudent(studentId: number) {
        return await this.gradeRepository.find({ where: { student_id: studentId } });
    }
    async findOne(id,user:JwtPayload){
        let queryConditions: any ={id:id};
        if(user.role==UserRole.STUDENT){
            queryConditions.student = {user_id:user.sub};
        }

        const grade= await this.gradeRepository.findOne({
            where: queryConditions,
            relations:{
                student: true
            }
        });
        if(!grade){
            throw new NotFoundException(`Grade with id ${id} not found`);
        }
        return grade;
    }
        async remove(id:number){
            const result = await this.gradeRepository.delete(id);
            if(result.affected===0){
                throw new NotFoundException(`Grade with id ${id} doesn't exist.`);
            }
            return {message:`Grade with id ${id} was removed.`};
        }
        async update(id:number, updateGradeDto:UpdateGradesDto,user:JwtPayload) {
            const grade = await this.gradeRepository.findOne({where:{id}});
            if(!grade){
                throw new NotFoundException(`Grade with id ${id} not found.`);
            }
            if(user.role===UserRole.TEACHER && grade.teacher_id!==user.sub){
                throw new ForbiddenException('You can only update grades you have personally assigned.');
            }
            Object.assign(grade,updateGradeDto);
            return await this.gradeRepository.save(grade);
        }
}
