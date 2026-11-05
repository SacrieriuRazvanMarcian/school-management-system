import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole} from './user.entity';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';
import { Student } from 'src/students/student.entity';
import { Teacher } from 'src/teachers/teacher.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository <User>,
        @InjectRepository(Student) private studentRepository: Repository <Student>,
        @InjectRepository(Teacher) private teacherRepository: Repository <Teacher>,
        
    ) {}
    async create(createUserDto:CreateUserDto): Promise<User>{
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(createUserDto.password, saltRounds);
        const userToSave = this.userRepository.create({
            email:createUserDto.email,
            role:createUserDto.role,
            password:hashedPassword,
        });
        const savedUser =  await this.userRepository.save(userToSave);
        if(savedUser.role==='STUDENT'){
            const student = this.studentRepository.create({
                user_id:savedUser.id,
                first_name:createUserDto.first_name,
                last_name:createUserDto.last_name,
                date_of_birth:createUserDto.date_of_birth,
            });
            await this.studentRepository.save(student);
        } else if (savedUser.role === 'TEACHER'){
            const teacher = this.teacherRepository.create({
                user_id:savedUser.id,
                first_name:createUserDto.first_name,
                last_name:createUserDto.last_name,
            });
            await this.teacherRepository.save(teacher);
        }
        return savedUser;
    }

    async findAll(){
        return await this.userRepository.find({
            relations:{
                student:true,
                teacher:true,
            },
        });
    }
    async findOne(id:number){
        const user=await this.userRepository.findOne({
            where: {id},
            relations:{student:true, teacher:true}
        });
        if(!user){
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }
    async findOneByEmail(email:string): Promise<User | null> {
        return await this.userRepository.findOne({where:{email},relations:{student:true,teacher:true}});
    }

    async update(id:number, updateUserDto:UpdateUserDto){
        if(updateUserDto.password){
            const salt=10;
            updateUserDto.password=await bcrypt.hash(updateUserDto.password,salt);
        }
        const user=await this.userRepository.preload({
            id,
            ...(updateUserDto.email && {email:updateUserDto.email}),
            ...(updateUserDto.password && {password:updateUserDto.password}),
            ...(updateUserDto.role && {role:updateUserDto.role}),
        });
        if(!user){
            throw new NotFoundException(`User with id ${id} not found.`);
        }
        
        await this.userRepository.save(user);

        if (user.role === 'STUDENT') {
        const studentUpdateData: Partial<Student> = {};
        
        if (updateUserDto.first_name) studentUpdateData.first_name = updateUserDto.first_name;
        if (updateUserDto.last_name) studentUpdateData.last_name = updateUserDto.last_name;
        if (updateUserDto.date_of_birth) studentUpdateData.date_of_birth = updateUserDto.date_of_birth;
        if (updateUserDto.class_id !== undefined) studentUpdateData.class_id = updateUserDto.class_id;

        if (Object.keys(studentUpdateData).length > 0) {
            await this.studentRepository.update({ user_id: id }, studentUpdateData);
        }

    } else if (user.role === 'TEACHER') {
        const teacherUpdateData: Partial<Teacher> = {};
        
        if (updateUserDto.first_name) teacherUpdateData.first_name = updateUserDto.first_name;
        if (updateUserDto.last_name) teacherUpdateData.last_name = updateUserDto.last_name;

        if (Object.keys(teacherUpdateData).length > 0) {
            await this.teacherRepository.update({ user_id: id }, teacherUpdateData);
        }
    }
        return await this.userRepository.findOne({
            where: {id},
            relations:{student:true,teacher:true}
        });
        
    }
    async remove(id:number){
        const rez= await this.userRepository.delete(id);
        if(rez.affected===0){
            throw new NotFoundException(`User with id ${id} doesn't exist.`);
        }
        return {message:`User with id ${id} was removed.`};
    }
}
