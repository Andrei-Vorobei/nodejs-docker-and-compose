import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  MinLength,
  MaxLength,
  IsString,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  @Exclude()
  yandexId: string | null;

  @Column({ unique: true })
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  username: string;

  @Column({ length: 200, default: 'Пока ничего не рассказал о себе' })
  @MinLength(2)
  @MaxLength(200)
  @IsString()
  about: string;

  @Column({
    default: 'https://i.pravatar.cc/300',
    length: 500,
  })
  @IsUrl({ require_protocol: true })
  avatar: string;

  @Column({ unique: true, length: 255 })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (list) => list.owner)
  wishlists: Wishlist[];
}
