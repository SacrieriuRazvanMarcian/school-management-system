import { PartialType } from "@nestjs/mapped-types";
import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTeacherDto{
    @IsNumber()
    @IsEmpty()
    user_id:number;

    @IsString()
    @IsNotEmpty()
    first_name:string;

    @IsString()
    @IsNotEmpty()
    last_name:string;
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto){}