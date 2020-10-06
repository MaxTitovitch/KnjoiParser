import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import { Brand } from './Brand'

@Entity({name: 'ratings'})
export class Rating {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column({ type: 'integer' })
  star: number;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(type => Brand, brand => brand.ratings, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: 'brand_id'})
  brand: Brand;
}