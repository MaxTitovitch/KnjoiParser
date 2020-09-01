import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import { AffiliateProgram } from './AffiliateProgram'
import { ProgramCategory } from "./ProgramCategory";

@Entity({name: 'program_values'})
export class ProgramValue {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  value: string;

  @Column('text')
  link: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(type => AffiliateProgram, affiliate_program => affiliate_program.program_values, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: 'affiliate_program_id'})
  affiliate_program: AffiliateProgram;

  @ManyToOne(type => ProgramCategory, program_category => program_category.program_values, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: 'program_category_id'})
  program_category: ProgramCategory;

}