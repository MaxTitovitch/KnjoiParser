let puppeteer = require('puppeteer')
let fs = require('fs')

module.exports = class KnjoiParser {
  /**
   *
   *  Common
   *
   */
  constructor (brandsLink, parentNode, connection, names = []) {
    this.initUrl = brandsLink
    this.brands = []
    this.parentNode = parentNode
    this.connection = connection
    this.names = names
    debugger;
  }

  getBrands () {
    return this.brands
  }

  async createPage (browser, url) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.setViewport({ width: 1920, height: 926 })
    await page.goto(url)

    return page
  }

  /**
   *
   *  Brands
   *
   */
  async parse () {
    this.browser = await puppeteer.launch({ headless: true})
    // this.browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] })
    let page = await this.createPage(this.browser, this.initUrl)
    await this.startParsing(page)
    await this.browser.close()
  }

  async startParsing (page) {
    await page.goto(this.initUrl)
    let pageQuantity = await this.getPageQuantity(page)
    console.log(`Pages to parsing: ${pageQuantity}`)
    await this.parseBrandPages(page, pageQuantity)
  }

  async getPageQuantity (page) {
    return page.evaluate(() => {
      return Number($('.pagination_key:last').eq(0).text().split(',').join(''))
    })
  }

  async parseBrandPages (page, pageQuantity) {
    // for (let i = 1; i <= 17; i++) {
    for (let i = 1; i <= pageQuantity; i++) {
      console.log(`The ${i}th page is parse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}...`)
      let link = `${this.initUrl}?page=${i}`
      await page.goto(link)
      let brandLinks = await this.getBrandLinks(page)
      let brands = await this.parseOneBrandPage(brandLinks)
      await this.saveBrands(brands)
    }
  }

  async getBrandLinks (page) {
    return page.evaluate((names) => {
      let links = []
      $('.storedirectory--table').eq(0).find('.storedirectory--store').toArray().forEach((element) => {
        let a = $(element).find('a')[1]
        if (names.lastIndexOf(a.innerText) === -1) {
          links.push(a.getAttribute('href'))
        }
      })
      return links
    }, this.names)
  }

  async parseOneBrandPage (links) {
    let brands = []
    // for (let i = 5; i < 7; i++) {
      for (let i = 0; i < links.length; i++) {
      let brandsPage = await this.createPage(this.browser, links[i])
      await brandsPage.waitFor(1500)
      let brand = await this.parseOneBrand(brandsPage)
      await brandsPage.close()
      if (brand != null) brands.push(brand)
    }
    return brands
  }

  async parseOneBrand (page) {
    return page.evaluate(() => {
      String.prototype.replaceSpan = function () {
        return this.split('<span class="bold">').join('<b>').split('</span>').join('</b>')
      }
      String.prototype.replaceAll = function (splits, to) {
        let str = this
        for (let i = 0; i < splits.length; i++) {
          str = str.split(splits[i]).join(to)
        }
        return str
      }

      Array.prototype.last = function () {
        return this[this.length - 1]
      }

      let statistics = [], scorecards = [], strengths = [], contacts = [], ratings = [], faqs = [], rated = '',
        reviews = '', review = ''
      $('.pfeature.hidetablecell__700').toArray().forEach((element) => {
        let statistic = {}
        statistic.name = $(element).find('.pfeature__title').text()
        statistic.link = $(element).find('a').eq(0).attr('href')
        let className = $(element).children('div').eq(1).attr('class')
        if ($(element).hasClass('hoverdiv')) {
          statistic.value = $(element).find('.prel').eq(0).children().text().split(' out of')[0].split(' ').last()
        } else if ($(element).find('.pfeature_tdlink').length != 0) {
          statistic.value = $(element).find('.pfeature__rating--large').eq(0).children('div').length - 5
        } else if (className.split('--').lastIndexOf('yes') !== -1) {
          statistic.value = 'yes'
        } else if (className.split('--').lastIndexOf('no') !== -1) {
          statistic.value = 'no'
        } else if (className.split('--').lastIndexOf('none') !== -1) {
          statistic.value = 'none'
        } else if ($(element).find('.pfeature__score--large').eq(0).children('a').length == 1) {
          statistic.value = $(element).find('.pfeature__score--large').eq(0).children('a').text()
        } else {
          statistic.value = $(element).find('.pfeature__rating--large a').eq(0).children('div').length - 5
        }
        statistics.push(statistic)
      })

      $('.fscorecard__item').toArray().forEach((element) => {
        let scorecard = {}
        scorecard.name = $(element).find('.fscorecard__item--label').text().replace(':', '')
        scorecard.value = $(element).find('.fscorecard__item--score').text()
        scorecards.push(scorecard)
      })

      $('.container300left__main>.module.ptext>ul:first li').toArray().forEach((element) => {
        strengths.push({ name: $(element).text().replaceAll([' details'], '') })
      })

      $('.prettylist2 li a').toArray().forEach((element) => {
        contacts.push({ name: $(element).text(), link: $(element).attr('href') })
      })

      $('.module.ptext.bluelinks>.fscorecard__heading.fscorecard__heading--large').toArray().forEach((element) => {
        let nameParts = $(element).text().split(' ')
        nameParts.pop()
        nameParts.pop()
        ratings.push({
          name: nameParts.join(' '),
          star: $(element).find('.star__on2').length,
          description: $(element).next().html()
        })
      })

      $('h2.fs25.mb30').parent().children('h3').toArray().forEach((element) => {
        faqs.push({
          name: $(element).text(),
          value: $(element).next().clone().children().remove().end().text().trim(),
          link: $(element).next().find('a').attr('href')
        })
      })

      try {
        rated = $('.tacenter .fs13.grey7').text().split('-')[0].trim().split(' ')[1]
        reviews = $('.tacenter .fs13.grey7').text().split('-')[1].trim().split(' ')[0]
      } catch (e) {
        rated = '0'
        reviews = $('.tacenter .fs13.grey7').text().split('-')[0].split(' ')[0]
      }

      try {
        review = `${$('.container300left__main>div').eq(1).find('p').eq(0).html().replaceSpan()} ${$('.container300left__main>div').eq(1).find('p').eq(2).html().replaceSpan()}`
      } catch (e) {
        review = $('.container300left__main>div').eq(1).find('p').eq(0).html().replaceSpan()
      }

      return {
        'name': $('h1').text().replaceAll([' Review'], ''),
        'link': $('.tacenter .href.gra').text(),
        rated, reviews, review,
        'description': $('h1').parent().parent().children('.bluelinks').html().replaceSpan(),
        'about': $('.module>.fs13.ptext').html().replaceSpan(),
        'slug': $('.merchantpage__logo').find('img').attr('src'),
        statistics, scorecards, strengths, contacts, ratings, faqs
      }
    })
  }

  async saveBrands (brands) {
    console.log(`Data saving started: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}...`)
    this.brands = brands
    await this.parentNode.startSaving(this.connection, brands, this.names)
    console.log(`Data has saved: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}!`)
  }

  /**
   *
   * Affiliate Programs
   *
   */
  async parseAffiliatePrograms (links) {
    this.browser = await puppeteer.launch({ headless: true, args: ['--start-maximized'] })
    // this.browser = await puppeteer.launch({ headless: true, args: ['--start-maximized'] })
    await this.startAffiliateParsing(links)
    await this.browser.close()

  }

  async startAffiliateParsing (links) {
    for (let i = 30448; i < links.length; i++) {
      try {
        let page = await this.createPage(this.browser, links[i][0])
        console.log(`Brands to parsing: ${i + 1} of ${links.length}`)
        let affiliate_program = await this.getProgramData(page, links[i][1])
        if (affiliate_program.amazon_link)
          affiliate_program.amazon_link = await this.changeLink(page, affiliate_program.amazon_link)
        await page.close()
        await this.parentNode.startAffiliateSaving(this.connection, affiliate_program)
      } catch (e) {}
    }
  }

  async getProgramData (page, brand) {
    return page.evaluate((brand) => {
      String.prototype.replaceSpan = function () {
        return this.split('<span class="bold">').join('<b>').split('</span>').join('</b>')
      }
      return {
        text: $('.module').find('.ptext').eq(0).text(),
        rating: $('.fs13.grey9.fl.mt15').text().split(':')[1].split('-')[0].trim(),
        description_first: $('.ptext.answer__text.bluelinks span.fr-view').children('p').eq(0).html().replaceSpan(),
        description_second: $('.ptext.answer__text.bluelinks span.fr-view').children('p').eq(1).html().replaceSpan(),
        update_text: $('.ptext.answer__text.bluelinks').children('p').eq(0).html().replaceSpan(),
        amazon_link: $('.ptext.answer__text.bluelinks').find('span[name]').eq(0).attr('name'),
        amazon_rating: $('.bgfa.gr8.bb.pd10r.italic.fs12').eq(0).text().split(':')[1].trim(),
        program_values: $('.ptext.answer__text.bluelinks>.fr-view>ul>li').toArray().map(function (el) {
          return {
            program_category: $(el).clone().children().remove().end().text().split(':')[0].trim(),
            link: $(el).find('a').eq(0).attr('href') || location.href,
            value: $(el).find('span.bold, strong').text().trim()
          }
        }),
        brand
      }
    }, brand)
  }

  async changeLink (page, link) {
    await page.goto(link)
    await page.waitFor(1000)
    return await page.url()
  }
}
