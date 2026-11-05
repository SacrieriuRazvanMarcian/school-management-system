import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateClassDto{
    @IsString()
    @IsNotEmpty()
    name:string;

    @IsNumber()
    @IsOptional()
    teacher_id?:number;
}

export class UpdateClassDto extends PartialType(CreateClassDto){}