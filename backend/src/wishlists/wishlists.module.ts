import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { UsersModule } from 'src/users/users.module';
import { Wish } from 'src/wishes/entities/wish.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Wishlist, Wish])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
