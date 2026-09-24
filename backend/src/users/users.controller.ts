import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { WishesService } from '../wishes/wishes.service';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    username: string;
  };
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async findMe(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findUserById(req.user.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, yandexId, ...profile } = user;

    return profile;
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    await this.usersService.updateUser(req.user.id, dto);

    return this.findMe(req);
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async findOwnWishes(@Req() req: AuthenticatedRequest) {
    return this.wishesService.findWishesByOwnerId(req.user.id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async findUserWishes(
    @Param('username') username: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = await this.usersService.findUserByFilter({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const wishes = await this.wishesService.findWishesByOwnerUsername(
      username,
      req.user.id,
    );

    return wishes;
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async findUser(@Param('username') username: string) {
    const user = await this.usersService.findUserByFilter({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, yandexId, email, ...publicUser } = user;

    return publicUser;
  }

  @UseGuards(JwtGuard)
  @Post('find')
  async findMany(@Body() dto: FindUsersDto) {
    const users = await this.usersService.findManyBySearch(dto.query);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, yandexId, email, ...user }) => user);
  }
}
