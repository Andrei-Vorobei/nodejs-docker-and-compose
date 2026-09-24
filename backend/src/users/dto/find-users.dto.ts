import { IsString, MinLength } from 'class-validator';

export class FindUsersDto {
  @IsString()
  @MinLength(1)
  query: string;
}
