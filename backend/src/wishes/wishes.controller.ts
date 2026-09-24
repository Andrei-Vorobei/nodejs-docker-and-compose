import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findWish(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: User },
  ) {
    return this.wishesService.findWish(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post()
  async createWish(@Body() dto: CreateWishDto, @Req() req: { user: User }) {
    return this.wishesService.createWish(dto, req.user);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copyWish(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: User },
  ) {
    return this.wishesService.getCopy(id, req.user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateWish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
    @Req() req: { user: User },
  ) {
    return this.wishesService.updateWish(id, req.user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async removeWish(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: User },
  ) {
    return this.wishesService.removeWish(id, req.user.id);
  }
}
