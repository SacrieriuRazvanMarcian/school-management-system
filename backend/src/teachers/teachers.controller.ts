import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './create-teacher.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { Roles } from '../auth/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard,RolesGuard)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService){}
    
    @Post()
    @Roles(UserRole.ADMIN)
    async createTeacher(@Body() CreateTeacherDto: CreateTeacherDto){
        return await this.teachersService.create(CreateTeacherDto);
    }
    
    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(){
        return await this.teachersService.findAll();
    }
    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id',ParseIntPipe) id:number){
        return await this.teachersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id', ParseIntPipe) id:number, @Body() updateTeacherDto:UpdateTeacherDto){
        return await this.teachersService.update(id,updateTeacherDto);
    }
    
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id',ParseIntPipe) id:number){
        return await this.teachersService.remove(id);
    }

}
