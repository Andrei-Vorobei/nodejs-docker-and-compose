import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

type AuthenticatedRequest = Request & {
  user: Pick<User, 'id'>;
};

@Controller('offers')
@UseGuards(AuthGuard('jwt'))
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAllOffers(@Req() req: AuthenticatedRequest) {
    return this.offersService.findAllOffers(req.user.id);
  }

  @Get(':id')
  async findOneOffer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.offersService.findOneOffer(id, req.user.id);
  }

  @Post()
  async createOffer(
    @Body() dto: CreateOfferDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.offersService.createOffer(dto, userId);
  }
}
