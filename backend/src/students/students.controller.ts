import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './create-student.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { RequestForUser } from 'src/auth/auth.interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard,RolesGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService){}
    
    @Post()
    @Roles(UserRole.ADMIN)
    async createStudent(@Body() createStudentDto:CreateStudentDto){
        return await this.studentsService.create(createStudentDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(){
        return await this.studentsService.findAll();
    }

    @Get(':id')
    @Roles(...Object.values(UserRole))
    async findOne(@Param('id',ParseIntPipe) id:number,@Req() req:RequestForUser){
        return await this.studentsService.findOne(id,req.user);
    }
    
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id', ParseIntPipe) id:number, @Body() updateStudentDto:UpdateStudentDto){
        return await this.studentsService.update(id,updateStudentDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id',ParseIntPipe) id:number){
        return await this.studentsService.remove(id);
    }
}
