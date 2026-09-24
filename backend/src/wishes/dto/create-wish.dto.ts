import {
  IsNumber,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWishDto {
  @MinLength(1)
  @MaxLength(250)
  @IsString()
  name: string;

  @IsUrl({ require_protocol: true })
  link: string;

  @IsUrl({ require_protocol: true, allow_relative: false })
  image: string;

  @IsNumber()
  @Min(1)
  price: number;

  @MinLength(1)
  @MaxLength(1024)
  @IsString()
  description: string;
}
