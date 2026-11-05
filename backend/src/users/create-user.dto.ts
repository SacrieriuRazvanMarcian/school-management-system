import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, ValidateIf} from "class-validator";
import { UserRole } from "./user.entity";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";

export class CreateUserDto{
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1,
        minSymbols:1,
    },{message: 'Weak password.'})
    password:string;

    @IsEnum(UserRole,{message:'Invalid role'})
    @IsNotEmpty()
    role:UserRole

    @ValidateIf(o=>o.role === 'STUDENT' || o.role === 'TEACHER')
    @IsString()
    first_name?:string;

    @ValidateIf(o=>o.role === 'STUDENT' || o.role === 'TEACHER')
    @IsString()
    last_name?:string;

    @ValidateIf(o=>o.role === 'STUDENT')
    @Type(()=>Date)
    @IsDate()
    date_of_birth?:Date;

    @IsOptional()
    @IsNumber()
    class_id?:number;

}

export class UpdateUserDto extends PartialType(CreateUserDto){}