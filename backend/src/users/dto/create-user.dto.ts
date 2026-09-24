import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(200)
  about?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatar?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  password: string;
}
