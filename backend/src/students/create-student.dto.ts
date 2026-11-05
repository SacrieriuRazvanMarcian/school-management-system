import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString} from "class-validator";
import { PartialType } from "@nestjs/mapped-types"

export class CreateStudentDto{
    @IsNumber()
    @IsNotEmpty()
    user_id:number;

    @IsString()
    @IsNotEmpty()
    first_name:string;

    @IsString()
    @IsNotEmpty()
    last_name:string;
    
    @Type(()=>Date)
    @IsDate()
    @IsNotEmpty()
    date:Date;

    @IsNumber()
    @IsNotEmpty()
    class_id:number;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto){}