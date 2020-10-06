import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'

import {ProgramValue} from "./ProgramValue";

@Entity({name: 'program_categories'})
export class ProgramCategory {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @OneToMany(type => ProgramValue, program_value => program_value.affiliate_program)
  program_values: ProgramValue[];
}