import {
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalGuard } from './local.guard';
import { AuthService, AuthenticatedUser } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(
    @Body() _dto: SigninUserDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.authService.auth(req.user.id);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const existingUser = await this.usersService.findUserByFilter({
      username: dto.username,
    });

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким username уже зарегистрирован',
      );
    }

    const existingEmail = await this.usersService.findUserByFilter({
      email: dto.email,
    });

    if (existingEmail) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }

    const createdUser = await this.usersService.createUser(dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, yandexId, ...profile } = createdUser;

    return profile;
  }
}
