import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany} from 'typeorm'
import { Brand } from './Brand'
import { ProgramValue } from './ProgramValue'

@Entity({name: 'affiliate_programs'})
export class AffiliateProgram {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    text: string;

    @Column({ type: "decimal" })
    rating: number;

    @Column('text')
    description_first: string;

    @Column('text')
    description_second: string;

    @Column('text')
    update_text: string;

    @Column({type:'text', nullable: true})
    amazon_link: string;

    @Column({ type: "decimal" })
    amazon_rating: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string;

    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
    updated_at: string;

    @OneToOne(type => Brand, brand => brand.affiliate_program)
    @JoinColumn({name: 'brand_id'})
    brand: Brand;

    @OneToMany(type => ProgramValue, program_value => program_value.affiliate_program)
    program_values: ProgramValue[];
}

