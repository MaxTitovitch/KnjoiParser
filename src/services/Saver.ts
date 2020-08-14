import "reflect-metadata";
import {Column, Connection, createConnection, JoinColumn, OneToMany, OneToOne, Repository} from "typeorm";
import {Brand} from '../entity/Brand'
import {Contact} from '../entity/Contact'
import {Faq} from '../entity/Faq'
import {Rating} from '../entity/Rating'
import {Scorecard} from '../entity/Scorecard'
import {Statistic} from '../entity/Statistic'
import {Strength} from '../entity/Strength'
import request from 'request';

export class Saver {
    private brandRepository: Repository<Brand>;
    private contactRepository: Repository<Contact>;
    private faqRepository: Repository<Faq>;
    private ratingRepository: Repository<Rating>;
    private scorecardRepository: Repository<Scorecard>;
    private statisticRepository: Repository<Statistic>;
    private strengthRepository: Repository<Strength>;
    private connection: Promise<Connection>;


    constructor() {
        this.connection = createConnection()
    }

    public saveData(brands: Brand[]): void {
        this.connection.then(async connection => {
            this.brandRepository = connection.getRepository(Brand);
            this.contactRepository = connection.getRepository(Contact);
            this.faqRepository = connection.getRepository(Faq);
            this.ratingRepository = connection.getRepository(Rating);
            this.scorecardRepository = connection.getRepository(Scorecard);
            this.statisticRepository = connection.getRepository(Statistic);
            this.strengthRepository = connection.getRepository(Strength);
            await this.clearLastData(connection);
            await this.startSaving(connection, brands);
            await connection.close();
        }).catch(error => console.log(error));
    }


    private async startSaving(connection: Connection, brands: Brand[]) {
        for (const brandObject of brands) {
            let brand = new Brand();
            brand.name = brandObject.name;
            brand.link = brandObject.link;
            brand.rated = brandObject.rated;
            brand.reviews = brandObject.reviews;
            brand.description = brandObject.description;
            brand.about = brandObject.about;
            brand.review = brandObject.review;
            brand.slug = brandObject.slug;
            await this.brandRepository.save(brand);
            await this.saveStatistics(brand, brandObject.statistics);
            await this.saveScorecards(brand, brandObject.scorecards);
            await this.saveStrengths(brand, brandObject.strengths);
            await this.saveContacts(brand, brandObject.contacts);
            await this.saveRatings(brand, brandObject.ratings);
            await this.saveFaqs(brand, brandObject.faqs);
        }
    }

    private async saveStatistics(brand: Brand, statistics: Statistic[]) {
        for (const statisticName of statistics) {
            let statistic = new Statistic();
            statistic.name = statisticName.name;
            statistic.value = statisticName.value;
            statistic.link = statisticName.link;
            statistic.brand = brand;
            await this.statisticRepository.save(statistic);
        }
    }

    private async saveScorecards(brand: Brand, scorecards: Scorecard[]) {
        for (const scorecardName of scorecards) {
            let scorecard = new Scorecard();
            scorecard.name = scorecardName.name;
            scorecard.value = scorecardName.value;
            scorecard.brand = brand;
            await this.scorecardRepository.save(scorecard);
        }
    }

    private async saveStrengths(brand: Brand, strengths: Strength[]) {
        for (const strengthName of strengths) {
            let strength = new Strength();
            strength.name = strengthName.name;
            strength.brand = brand;
            await this.strengthRepository.save(strength);
        }
    }

    private async saveContacts(brand: Brand, contacts: Contact[]) {
        for (const contactName of contacts) {
            let contact = new Contact();
            contact.name = contactName.name;
            contact.link = contactName.link;
            contact.brand = brand;
            await this.contactRepository.save(contact);
        }
    }

    private async saveRatings(brand: Brand, ratings: Rating[]) {
        for (const ratingName of ratings) {
            let rating = new Rating();
            rating.name = ratingName.name;
            rating.star = ratingName.star;
            rating.description = ratingName.description;
            rating.brand = brand;
            await this.ratingRepository.save(rating);
        }
    }

    private async saveFaqs(brand: Brand, faqs: Faq[]) {
        for (const faqName of faqs) {
            let faq = new Faq();
            faq.name = faqName.name;
            faq.value = faqName.value;
            faq.link = faqName.link;
            faq.brand = brand;
            await this.faqRepository.save(faq);
        }
    }

    private async clearLastData(connection: Connection) {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await this.contactRepository.clear();
        await this.faqRepository.clear();
        await this.ratingRepository.clear();
        await this.scorecardRepository.clear();
        await this.statisticRepository.clear();
        await this.strengthRepository.clear();
        await this.brandRepository.clear();
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
}