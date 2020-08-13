import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import { Brand } from './Brand'

@Entity({name: 'scorecards'})
export class Scorecard {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  value: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(type => Brand, brand => brand.scorecards, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: 'brand_id'})
  brand: Brand;
}