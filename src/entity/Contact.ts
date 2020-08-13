import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import { Brand } from './Brand'

@Entity({name: 'contacts'})
export class Contact {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  link: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(type => Brand, brand => brand.contacts, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: 'brand_id'})
  brand: Brand;
}