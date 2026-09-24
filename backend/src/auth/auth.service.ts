import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from 'passport-yandex';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

export type AuthenticatedUser = Pick<User, 'id'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  auth(id: number): { access_token: string } {
    return {
      access_token: this.jwtService.sign({
        sub: id,
      }),
    };
  }

  async validatePassword(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersService.findUserByFilter({ username });

    if (!user || !user.password) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return { id: user.id };
  }

  async validateFromYandex(profile: Profile): Promise<AuthenticatedUser> {
    let user = await this.usersService.findByYandexID(profile.id);

    if (!user) {
      user = await this.usersService.createFromYandex(profile);
    }

    return { id: user.id };
  }
}
