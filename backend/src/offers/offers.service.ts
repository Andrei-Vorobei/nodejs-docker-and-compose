import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  private readonly relations = [
    'user',
    'item',
    'item.owner',
    'item.offers',
    'item.offers.user',
  ];

  private hidePrivateFields(offer: Offer, viewerId?: number): Offer {
    if (offer.user && offer.hidden && offer.user.id !== viewerId) {
      offer.user = null as unknown as User;
    } else if (offer.user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, yandexId, email, ...publicUser } = offer.user;
      offer.user = publicUser as User;
    }

    if (offer.item?.owner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, yandexId, email, ...publicOwner } = offer.item.owner;

      offer.item.owner = publicOwner as User;
    }

    for (const nestedOffer of offer.item?.offers ?? []) {
      if (
        nestedOffer.user &&
        nestedOffer.hidden &&
        nestedOffer.user.id !== viewerId
      ) {
        nestedOffer.user = null as unknown as User;
      } else if (nestedOffer.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, yandexId, email, ...publicUser } = nestedOffer.user;

        nestedOffer.user = publicUser as User;
      }
    }

    return offer;
  }

  async findAllOffers(viewerId?: number): Promise<Offer[]> {
    const offers = await this.offerRepository.find({
      relations: this.relations,
    });

    return offers.map((offer) => this.hidePrivateFields(offer, viewerId));
  }

  async findOneOffer(id: number, viewerId?: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    if (!offer) {
      throw new NotFoundException('Offer не найден');
    }

    return this.hidePrivateFields(offer, viewerId);
  }

  async createOffer(dto: CreateOfferDto, userId: number): Promise<Offer> {
    await this.offerRepository.manager.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const wishRepository = manager.getRepository(Wish);
      const offerRepository = manager.getRepository(Offer);

      const user = await userRepository.findOneBy({
        id: userId,
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const item = await wishRepository
        .createQueryBuilder('wish')
        .innerJoinAndSelect('wish.owner', 'owner')
        .where('wish.id = :id', { id: dto.itemId })
        // Блокируем подарок до завершения транзакции,
        // чтобы параллельные offer не использовали старое значение raised.
        .setLock('pessimistic_write')
        .getOne();

      if (!item) {
        throw new NotFoundException('Подарок не найден');
      }

      if (item.owner.id === userId) {
        throw new ForbiddenException(
          'Нельзя сделать offer на собственный wish',
        );
      }

      const remaining = Number(item.price) - Number(item.raised);

      if (remaining <= 0) {
        throw new BadRequestException(
          'На подарок уже собрана необходимая сумма',
        );
      }

      if (dto.amount > remaining) {
        throw new BadRequestException(
          'Сумма offer превышает оставшуюся сумму подарка',
        );
      }

      const offer = offerRepository.create({
        amount: dto.amount,
        hidden: dto.hidden ?? false,
        item,
        user,
      });

      await offerRepository.save(offer);

      // Атомарно увеличиваем сумму сбора.
      await wishRepository
        .createQueryBuilder()
        .update(Wish)
        .set({
          raised: () => 'raised + :amount',
        })
        .setParameters({
          amount: dto.amount,
        })
        .where('id = :id', { id: item.id })
        .execute();
    });

    // Загружаем итоговый offer уже после завершения транзакции.
    const createdOffer = await this.offerRepository.findOne({
      where: {
        user: { id: userId },
        item: { id: dto.itemId },
      },
      order: {
        id: 'DESC',
      },
      relations: this.relations,
    });

    if (!createdOffer) {
      throw new NotFoundException('Созданный offer не найден');
    }

    return this.hidePrivateFields(createdOffer, userId);
  }
}
