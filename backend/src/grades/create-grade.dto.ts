import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

const AVAILABLE_SUBJECTS = [
    'Math',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Computer Science',
    'Physical Education',
    'Art'
  ];

export class CreateGradeDto{
    @IsInt({message:'Grade must be a whole number.'})
    @Min(1)
    @Max(10)
    @IsNotEmpty()
    value:number;

    @IsString()
    @IsNotEmpty()
    @IsIn(AVAILABLE_SUBJECTS,{message:'Invalid subject. Please select a predefined school subject.'})
    subject:string;

    @Type(()=>Date)
    @IsDate()
    @IsNotEmpty()
    date:Date

    @IsNumber()
    @IsNotEmpty()
    student_id:number;

    @IsNumber()
    @IsOptional()
    teacher_id?:number;
}

export class UpdateGradesDto extends PartialType(CreateGradeDto){}