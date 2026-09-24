import { IsString, MaxLength, MinLength } from 'class-validator';

export class SigninUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(2)
  password: string;
}
