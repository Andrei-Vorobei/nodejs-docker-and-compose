import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @Column({ length: 500 })
  @IsUrl({ require_protocol: true })
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @ManyToMany(() => Wish)
  @JoinTable({ name: 'wishlist_items' })
  items: Wish[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
