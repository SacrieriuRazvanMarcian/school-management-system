import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard,RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    
    @Post()
    @Roles(UserRole.ADMIN)
    async createUser(@Body() createUserDto:CreateUserDto) {
        return await this.usersService.create(createUserDto);
     }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(){
        return await this.usersService.findAll();
    }

    @Get(':id')
    @Roles(...Object.values(UserRole))
    async findOne(@Param('id',ParseIntPipe)id:number){
        return await this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id', ParseIntPipe) id:number, @Body() updateUserDto:UpdateUserDto){
        return await this.usersService.update(id,updateUserDto);
    }
    
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id',ParseIntPipe) id:number){
        return await this.usersService.remove(id);
    }

}
