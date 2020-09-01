import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import { Statistic } from './Statistic'
import { Scorecard } from './Scorecard'
import { Strength } from './Strength'
import { Contact } from './Contact'
import { Rating } from './Rating'
import { Faq } from './Faq'
import { AffiliateProgram } from './AffiliateProgram'

@Entity({name: 'brands'})
export class Brand {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  link: string;

  @Column({ type: "decimal" })
  rated: number;

  @Column({ type: 'integer' })
  reviews: number;

  @Column('text')
  description: string;

  @Column('text')
  about: string;

  @Column('text')
  review: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @OneToMany(type => Statistic, statistic => statistic.brand)
  statistics: Statistic[];

  @OneToMany(type => Scorecard, scorecard => scorecard.brand)
  scorecards: Scorecard[];

  @OneToMany(type => Strength, strength => strength.brand)
  strengths: Strength[];

  @OneToMany(type => Contact, contact => contact.brand)
  contacts: Contact[];

  @OneToMany(type => Rating, rating => rating.brand)
  ratings: Rating[];

  @OneToMany(type => Faq, faq => faq.brand)
  faqs: Faq[];

  @OneToOne(type => AffiliateProgram, affiliate_program => affiliate_program.brand)
  affiliate_program: AffiliateProgram;
}

