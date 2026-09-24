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
import { Request } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};

@UseGuards(JwtGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async findAll() {
    return this.wishlistsService.findAllWishlists();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.findOneWishlist(id);
  }

  @Post()
  async create(
    @Body() dto: CreateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.createWishlist(dto, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.updateWishlist(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.removeWishlist(id, req.user.id);
  }
}
