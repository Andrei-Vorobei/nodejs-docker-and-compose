import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    private readonly usersService: UsersService,
  ) {}

  private async findItems(itemsId: number[]): Promise<Wish[]> {
    if (!itemsId?.length) {
      return [];
    }

    const items = await this.wishRepository.findBy({
      id: In(itemsId),
    });

    if (items.length !== new Set(itemsId).size) {
      throw new NotFoundException('Один или несколько подарков не найдены');
    }

    return items;
  }

  private hidePrivateFields(wishlist: Wishlist): Wishlist {
    if (wishlist.owner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, yandexId, email, ...publicOwner } = wishlist.owner;
      wishlist.owner = publicOwner as typeof wishlist.owner;
    }

    return wishlist;
  }

  async createWishlist(
    dto: CreateWishlistDto,
    ownerId: number,
  ): Promise<Wishlist> {
    const owner = await this.usersService.findUserById(ownerId);

    if (!owner) {
      throw new NotFoundException('Пользователь не найден');
    }

    const items = await this.findItems(dto.itemsId);

    const wishlist = this.wishlistRepository.create({
      name: dto.name,
      image: dto.image,
      owner,
      items,
    });

    const savedWishlist = await this.wishlistRepository.save(wishlist);

    return this.findOneWishlist(savedWishlist.id);
  }

  async findAllWishlists(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });

    return wishlists.map((wishlist) => this.hidePrivateFields(wishlist));
  }

  async findOneWishlist(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    return this.hidePrivateFields(wishlist);
  }

  async updateWishlist(
    id: number,
    userId: number,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя обновлять чужой вишлист');
    }

    const { itemsId, ...fields } = dto;

    Object.assign(wishlist, fields);

    if (itemsId !== undefined) {
      wishlist.items = await this.findItems(itemsId);
    }

    await this.wishlistRepository.save(wishlist);

    return this.findOneWishlist(id);
  }

  async removeWishlist(id: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалять чужой вишлист');
    }

    await this.wishlistRepository.delete(id);

    return this.hidePrivateFields(wishlist);
  }
}
