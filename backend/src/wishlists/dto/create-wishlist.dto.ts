import {
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl({ require_protocol: true })
  image: string;

  @IsArray()
  @IsInt({ each: true })
  itemsId: number[];
}
