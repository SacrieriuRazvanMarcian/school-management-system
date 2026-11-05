import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
    constructor (
        private usersService:UsersService,
        private jwtService:JwtService
    ){}
    async login(loginDto:LoginDto){
        const user=await this.usersService.findOneByEmail(loginDto.email);
        if(!user){
            throw new UnauthorizedException('Email or password wrong.');
        }
        const isMatch=await bcrypt.compare(loginDto.password, user.password);
        if(!isMatch){
            throw new UnauthorizedException('Email or password wrong.');
        
        }
        const payload = {sub:user.id, email:user.email, role:user.role};
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

}
