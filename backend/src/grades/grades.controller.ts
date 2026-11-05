import { Controller, Post, Body, Get, Param, ParseIntPipe, Req, Patch, Delete, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradesDto } from './create-grade.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { RequestForUser } from 'src/auth/auth.interfaces';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Grades')
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
    constructor(private readonly gradesService:GradesService){}
    
    @Post()
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    async createGrade(@Body() createGradeDto:CreateGradeDto,@Req() req:RequestForUser){
        return await this.gradesService.create(createGradeDto,req.user);
    }

    @Get()
    @Roles(...Object.values(UserRole))
    async findAll(@Req() req: RequestForUser){
        return await this.gradesService.findAll(req.user);
    }

    @Get(':id')
    @Roles(...Object.values(UserRole))
    async findOne(@Param('id',ParseIntPipe) id:number, @Req() req: RequestForUser){
        return await this.gradesService.findOne(id,req.user);
    }
    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    async findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
        return await this.gradesService.findByStudent(studentId);
    }
    @Patch(':id')
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    async update(@Param('id',ParseIntPipe) id:number,@Body() updateGradesDto:UpdateGradesDto,@Req() req:RequestForUser){
        return await this.gradesService.update(id,updateGradesDto,req.user);
    }
    
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id',ParseIntPipe) id:number){
        return await this.gradesService.remove(id);
    }
}
