import "reflect-metadata";
let  KnjoiParser = require('./services/KnjoiParser');
// @ts-ignore
let fs = require('fs');

const brandsLink = 'https://knoji.com/brand-directory/';

let runWork = async () => {
    let parser = new KnjoiParser(brandsLink);
    await parser.parse();
    let brands = await parser.getBrands();

    // console.log(JSON.stringify(brands, null, 4));
    fs.writeFileSync(`./brands.json`, JSON.stringify(brands), 'utf-8');
};

runWork().then(r => r);
