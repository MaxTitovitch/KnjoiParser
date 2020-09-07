import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeFaqValueType1599496999352 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `faqs` CHANGE `value` `value` TEXT NOT NULL;');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `faqs` CHANGE `value` `value` VARCHAR (255) NOT NULL;');
    }

}
