let {Saver} = require('./Saver');

let puppeteer = require('puppeteer')
let fs = require('fs')


module.exports = class KnjoiParser {
  constructor (brandsLink) {
    this.initUrl = brandsLink;
    this.brands = [];
    this.saver = new Saver();
    debugger;
  }

  getBrands () {
    return this.brands;
  }

  async parse () {
    this.browser = await puppeteer.launch({ headless: true, args: ['--start-maximized'] });
    let page = await this.createPage(this.browser, this.initUrl);
    await this.startParsing(page);
    await this.browser.close();
  }

  async startParsing (page) {
    await page.goto(this.initUrl);
    let pageQuantity = await this.getPageQuantity(page);
    console.log(`Pages to parsing: ${pageQuantity}`);
    await this.parseBrandPages(page, pageQuantity);
  }

  async getPageQuantity (page) {
     return page.evaluate(() => {
       return Number($('.pagination_key:last').eq(0).text().split(',').join(''));
    });
  }

  async parseBrandPages (page, pageQuantity) {
    for (let i = 664; i <= pageQuantity; i++) {
//     for (let i = 1; i <= 2; i++) {
      console.log(`The ${i}th page is parse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}...`);
      let link = `${this.initUrl}?page=${i}`;
      await page.goto(link);
      let brandLinks = await this.getBrandLinks(page);
      await this.parseOneBrandPage(brandLinks);
    }
    await this.saveBrands(this.brands);
  }

  async getBrandLinks (page) {
    return page.evaluate(() => {
      let links = [];
      $('.storedirectory--table').eq(0).find('.storedirectory--store').toArray().forEach((element) => {
        links.push($(element).children(':first').eq(0).attr('href'));
      });
      return links;
    });
  }

  async parseOneBrandPage (links) {
    // for (let i = 0; i < 15; i++) {
    for (let i = 0; i < links.length; i++) {
      try {
        let brandsPage = await this.createPage(this.browser, links[i]);
        // await this.scrollPage(brandsPage);
        let brand = await this.parseOneBrand(brandsPage);
        await brandsPage.close();
        if (brand != null) {
          this.brands.push(brand);
        }
      } catch (e) {
        continue;
      }
    }
  }

  async parseOneBrand (page) {
    return page.evaluate(() => {
      String.prototype.replaceSpan = function() {
        return this.split('<span class="bold">').join('<b>').split('</span>').join('</b>');
      };
      String.prototype.replaceAll = function(splits, to) {
        let str = this;
        for (let i = 0; i < splits.length; i++) {
          str = str.split(splits[i]).join(to);
        }
        return str;
      };

      Array.prototype.last = function () {
        return this[this.length-1]
      };

      try {
        // review?
        // strengths?
        // ratings?
        // faqs
        let statistics = [], scorecards = [], strengths = [], contacts = [], ratings = [], faqs = [];
        $('.pfeature.hidetablecell__700').toArray().forEach((element) => {
          let statistic = {};
          statistic.name = $(element).find('.pfeature__title').text();
          statistic.link = $(element).find('a').eq(0).attr('href');
          let className = $(element).children('div').eq(1).attr('class');
          if($(element).hasClass('hoverdiv') ) {
            statistic.value =  $(element).find('.prel').eq(0).children().text().split(' out of')[0].split(' ').last();
          } else if($(element).find('.pfeature_tdlink').length != 0 ) {
            statistic.value =  $(element).find('.pfeature__rating--large').eq(0).children('div').length - 5;
          } else if(className.split('--').lastIndexOf('yes') !== -1 ) {
            statistic.value = 'yes';
          } else if(className.split('--').lastIndexOf('no') !== -1 ) {
            statistic.value = 'no';
          } else if(className.split('--').lastIndexOf('none') !== -1 ) {
            statistic.value = 'none';
          } else if($(element).find('.pfeature__score--large').eq(0).children('a').length == 1 ) {
            statistic.value = $(element).find('.pfeature__score--large').eq(0).children('a').text();
          } else {
            statistic.value = $(element).find('.pfeature__rating--large a').eq(0).children('div').length - 5;
          }
          statistics.push(statistic);
        });

        $('.fscorecard__item').toArray().forEach((element) => {
          let scorecard = {};
          scorecard.name = $(element).find('.fscorecard__item--label').text().replace(':', '');
          scorecard.value = $(element).find('.fscorecard__item--score').text();
          scorecards.push(scorecard);
        });

        $('.container300left__main>.module.ptext>ul:first li').toArray().forEach((element) => {
          console.log($(element).text())
          strengths.push({name: $(element).text().replaceAll([' details'], '')})
        });

        $('.prettylist2 li a').toArray().forEach((element) => {
          contacts.push({name: $(element).text(), link: $(element).attr('href')});
        });

        $('.module.ptext.bluelinks>.fscorecard__heading.fscorecard__heading--large').toArray().forEach((element) => {
          let nameParts = $(element).text().split(' ');
          nameParts.pop(); nameParts.pop();
          ratings.push({
            name: nameParts.join(' '),
            star: $(element).find('.star__on2').length,
            description: $(element).next().html()
          });
        });

        $('h2.fs25.mb30').parent().children('h3').toArray().forEach((element) => {
          faqs.push({
            name: $(element).text(),
            value: $(element).next().clone().children().remove().end().text().trim(),
            link: $(element).next().find('a').attr('href')
          });
        });

        return {
          'name': $('h1').text().replaceAll([' Review'], ''),
          'link': $('.tacenter .href.gra').text(),
          'rated': $('.tacenter .fs13.grey7').text().split('-')[0].trim().split(' ')[1],
          'reviews': $('.tacenter .fs13.grey7').text().split('-')[1].trim().split(' ')[0],
          'description': $('h1').parent().parent().children('.bluelinks').html().replaceSpan(),
          'about': $('.module>.fs13.ptext').html().replaceSpan(),
          'review': `${$('.container300left__main>div').eq(1).find('p').eq(0).html().replaceSpan()} ${$('.container300left__main>div').eq(1).find('p').eq(2).html().replaceSpan()}`,
          // 'slug': $('h1').text().toLowerCase().replaceAll([' ', '\'', '"'], '-'),

          'slug': $('.merchantpage__logo').find('img').attr('src'),

          statistics, scorecards, strengths, contacts, ratings, faqs
        };
      } catch (e) {
        return null
      }
    })
  }



  async createPage (browser, url) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.setViewport({ width: 1920, height: 926 })
    await page.goto(url)

    return page
  }

  async scrollPage (page) {
    let size = await page.evaluate(_ => document.body.scrollHeight)
    for (let i = 0; i < size; i += 100) {
      await page.evaluate(function () {
        window.scrollTo(0, window.scrollY + 100)
      })
      await page.waitFor(20)
    }
  }

  async saveBrands (brands) {
    console.log(`Data saving started: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}...`);
    this.brands = brands;
    this.saver.saveData(brands);
    console.log(`Data has saved: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}!`);
  }
}
