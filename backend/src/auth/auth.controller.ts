import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    @Post('login')
    async login(@Body() loginDto:LoginDto){
        return this.authService.login(loginDto);
    }
}
