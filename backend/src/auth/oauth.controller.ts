import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, AuthenticatedUser } from './auth.service';
import { YandexGuard } from './yandex.guard';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(YandexGuard)
  @Get('yandex')
  yandex() {
    // Пустой метод — нормально. Стратегия сама инициирует редирект на Яндекс.
  }

  @UseGuards(YandexGuard)
  @Get('yandex/callback')
  async yandexCallback(@Req() req: Request & { user?: AuthenticatedUser }) {
    if (!req.user) {
      throw new UnauthorizedException(
        'Не удалось получить данные пользователя от Яндекса',
      );
    }

    return this.authService.auth(req.user.id);
  }
}
