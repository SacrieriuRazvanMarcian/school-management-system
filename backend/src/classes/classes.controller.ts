import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './create-class.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User, UserRole } from '../users/user.entity';
import { RequestForUser } from 'src/auth/auth.interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Classes')
@Controller('classes')
@UseGuards(JwtAuthGuard,RolesGuard)
export class ClassesController {
    constructor(private readonly classService:ClassesService){}
    
    @Post()
    @Roles(UserRole.ADMIN)
    async createClass(@Body() createClassDto:CreateClassDto){
        return await this.classService.create(createClassDto);
    }

    @Get()
    @Roles(...Object.values(UserRole))
    async findAll(){
        return await this.classService.findAll();
    }

    @Get(':id')
    @Roles(...Object.values(UserRole))
    async findOne(@Param('id',ParseIntPipe) id:number,@Req() req:RequestForUser){
        return await this.classService.findOne(id,req.user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id',ParseIntPipe) id:number,@Body() updateClassDto:UpdateClassDto){
        return await this.classService.update(id,updateClassDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id',ParseIntPipe) id:number){
        return await this.classService.remove(id);
    }
}
