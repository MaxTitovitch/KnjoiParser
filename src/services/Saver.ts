import "reflect-metadata";
import {Column, Connection, createConnection, JoinColumn, OneToMany, OneToOne, Repository} from "typeorm";
import {Brand} from '../entity/Brand'
import {Contact} from '../entity/Contact'
import {Faq} from '../entity/Faq'
import {Rating} from '../entity/Rating'
import {Scorecard} from '../entity/Scorecard'
import {Statistic} from '../entity/Statistic'
import {Strength} from '../entity/Strength'
import "reflect-metadata";
import {AffiliateProgram} from "../entity/AffiliateProgram";
import {ProgramCategory} from "../entity/ProgramCategory";
import {ProgramValue} from "../entity/ProgramValue";
let  KnjoiParser = require('./KnjoiParser');
const brandsLink = 'https://knoji.com/brand-directory/';

export class Saver {
    private brandRepository: Repository<Brand>;
    private contactRepository: Repository<Contact>;
    private faqRepository: Repository<Faq>;
    private ratingRepository: Repository<Rating>;
    private scorecardRepository: Repository<Scorecard>;
    private statisticRepository: Repository<Statistic>;
    private strengthRepository: Repository<Strength>;

    private affiliateProgramRepository: Repository<AffiliateProgram>;
    private programCategoryRepository: Repository<ProgramCategory>;
    private programValueRepository: Repository<ProgramValue>;

    private connection: Promise<Connection>;


    public startWork() {
        this.connection = createConnection();
        this.connection.then(async connection => {
            await this.prepareSaving(connection);
            // await this.clearLastData(connection);
            await this.saveData(connection);
            await connection.close();
        }).catch(error => console.log(error));
    }

    private async saveData(connection) {
        let parser = new KnjoiParser(brandsLink, this, connection);
        await parser.parse();
    }

    private async prepareSaving(connection) {
        this.brandRepository = connection.getRepository(Brand);
        this.contactRepository = connection.getRepository(Contact);
        this.faqRepository = connection.getRepository(Faq);
        this.ratingRepository = connection.getRepository(Rating);
        this.scorecardRepository = connection.getRepository(Scorecard);
        this.statisticRepository = connection.getRepository(Statistic);
        this.strengthRepository = connection.getRepository(Strength);
    }


    public async startSaving(connection: Connection, brands: Brand[]) {
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

    public startAffiliateWork() {
        this.connection = createConnection();
        this.connection.then(async connection => {
            await this.prepareAffiliateSaving(connection);
            // await this.clearAffiliateLastData(connection);
            await this.saveAffiliateData(connection);
            await connection.close();
        }).catch(error => console.log(error));
    }


    private async saveAffiliateData(connection) {
        let parser = new KnjoiParser(null, this, connection);
        let links = await this.prepareAffiliateLinks(connection);
        await parser.parseAffiliatePrograms(links);
    }


    private async prepareAffiliateLinks(connection) {
        let faqItems = await this.faqRepository.query("SELECT * FROM `faqs` where `name` LIKE '%affiliate%' AND `value` NOT LIKE 'Yes%'");
        return Object.values(faqItems).map(function (faq) {
            return [faq['link'], faq['brand_id']];
        });
    }

    private async prepareAffiliateSaving(connection) {
        this.faqRepository = connection.getRepository(Faq);
        this.affiliateProgramRepository = connection.getRepository(AffiliateProgram);
        this.programCategoryRepository = connection.getRepository(ProgramCategory);
        this.programValueRepository = connection.getRepository(ProgramValue);
    }

    private async clearAffiliateLastData(connection: Connection) {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await this.affiliateProgramRepository.clear();
        await this.programCategoryRepository.clear();
        await this.programValueRepository.clear();
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    }

    public async startAffiliateSaving(connection: Connection, program: AffiliateProgram) {
        let affiliateProgram = new AffiliateProgram();
        affiliateProgram.text = program.text;
        affiliateProgram.rating = program.rating;
        affiliateProgram.description_first = program.description_first;
        affiliateProgram.description_second = program.description_second;
        affiliateProgram.update_text = program.update_text;
        affiliateProgram.amazon_link = program.amazon_link;
        affiliateProgram.amazon_rating = program.amazon_rating;
        affiliateProgram['brand'] = program.brand;
        affiliateProgram = await this.affiliateProgramRepository.save(affiliateProgram);
        await this.saveProgramValues(affiliateProgram, program.program_values);
    }

    private async saveProgramValues(affiliateProgram: AffiliateProgram, program_values: ProgramValue[]) {
        for (const programObject of program_values) {
            let category = await this.findOrCreateCategory(programObject.program_category);
            let programValue = new ProgramValue();
            programValue.value = programObject.value;
            programValue.link = programObject.link;
            programValue.affiliate_program = affiliateProgram;
            programValue.program_category = category;
            await this.programValueRepository.save(programValue);
        }
    }

    private async findOrCreateCategory(programCategory) {
        let category = await this.programCategoryRepository.findOne({name: programCategory});
        if (!category) {
            category = new ProgramCategory();
            category.name = programCategory;
            category = await this.programCategoryRepository.save(category);
        }
        return category;
    }
}