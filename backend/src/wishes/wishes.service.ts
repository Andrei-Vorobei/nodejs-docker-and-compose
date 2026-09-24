import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  private readonly relations = ['owner', 'offers', 'offers.user'];

  private hidePrivateFields(wish: Wish, viewerId?: number): Wish {
    if (wish.owner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, yandexId, email, ...publicOwner } = wish.owner;
      wish.owner = publicOwner as typeof wish.owner;
    }

    for (const offer of wish.offers ?? []) {
      if (offer.user && offer.hidden && offer.user.id !== viewerId) {
        offer.user = null as unknown as User;
      } else if (offer.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, yandexId, email, ...publicUser } = offer.user;
        offer.user = publicUser as typeof offer.user;
      }
    }

    return wish;
  }

  async createWish(dto: CreateWishDto, user: User): Promise<Wish> {
    const owner = await this.usersService.findUserById(user.id);

    if (!owner) {
      throw new NotFoundException(`Пользователь с id ${user.id} не найден`);
    }

    const wish = this.wishRepository.create({
      ...dto,
      raised: 0,
      copied: 0,
      owner,
    });

    const savedWish = await this.wishRepository.save(wish);

    return this.findWish(savedWish.id, user.id);
  }

  async findWish(id: number, viewerId?: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    return this.hidePrivateFields(wish, viewerId);
  }

  async findWishesByOwnerUsername(
    username: string,
    viewerId?: number,
  ): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      where: {
        owner: { username },
      },
      relations: this.relations,
    });

    return wishes.map((wish) => this.hidePrivateFields(wish, viewerId));
  }

  async findWishesByOwnerId(
    ownerId: number,
    viewerId?: number,
  ): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      where: {
        owner: { id: ownerId },
      },
      relations: this.relations,
    });

    return wishes.map((wish) => this.hidePrivateFields(wish, viewerId));
  }

  async findLast(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      relations: this.relations,
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });

    return wishes.map((wish) => this.hidePrivateFields(wish));
  }

  async findTop(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      relations: this.relations,
      order: {
        copied: 'DESC',
      },
      take: 10,
    });

    return wishes.map((wish) => this.hidePrivateFields(wish));
  }

  async updateWish(
    id: number,
    userId: number,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя обновлять чужой подарок');
    }

    if (dto.price !== undefined && wish.offers.length > 0) {
      throw new BadRequestException(
        'Нельзя изменять стоимость подарка после появления заявок',
      );
    }

    if (dto.price !== undefined && dto.price < wish.raised) {
      throw new BadRequestException(
        'Стоимость подарка не может быть меньше собранной суммы',
      );
    }

    Object.assign(wish, dto);

    await this.wishRepository.save(wish);

    return this.findWish(id, userId);
  }

  async updateRaised(id: number, raised: number): Promise<void> {
    await this.wishRepository.update(id, { raised });
  }

  async removeWish(id: number, userId: number): Promise<Wish> {
    const wish = await this.findWish(id, userId);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалять чужой подарок');
    }

    await this.wishRepository.delete(id);

    return wish;
  }

  async getCopy(id: number, user: User): Promise<Wish> {
    const wish = await this.findWish(id, user.id);
    const owner = await this.usersService.findUserByFilter({ id: user.id });

    if (!owner) {
      throw new NotFoundException(`Пользователь с id ${user.id} не найден`);
    }

    const copiedWish = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      raised: 0,
      description: wish.description,
      copied: 0,
      owner,
    });

    await this.wishRepository.save(copiedWish);

    await this.wishRepository.increment({ id }, 'copied', 1);

    return this.findWish(copiedWish.id, user.id);
  }
}
