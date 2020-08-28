import "reflect-metadata";
let  KnjoiParser = require('./services/KnjoiParser');
// @ts-ignore
let fs = require('fs');

const brandsLink = 'https://knoji.com/brand-directory/';

let runWork = async () => {
    let parser = new KnjoiParser(brandsLink);
    await parser.parse();
};

runWork().then(r => r);
