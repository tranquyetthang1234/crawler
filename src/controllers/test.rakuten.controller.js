import cheerio from "cheerio";
import puppeteer from "puppeteer";
// import axios from "axios";
import axios from "axios-proxy-fix";

import errorResponse from "../core/error.response.js"
import SEND from "../core/success.response.js"

import configPuppeteer from "../configs/puppeteer.config.js"
import configProxy from "../configs/proxy.js"


async function crawlCategory(req, res, next) {

    const categories = [];
    const categoriesParentIgnore = [
        'https://www.rakuten.co.jp/category/auto/',
        'https://www.rakuten.co.jp/category/bedding/',
        'https://www.rakuten.co.jp/category/flower/',
        'https://www.rakuten.co.jp/category/service/',
    ]
    const subcateIgnore = [
        'https://www.rakuten.co.jp/category/110472/',
        'https://www.rakuten.co.jp/category/100236/',
        'https://www.rakuten.co.jp/category/100228/',
        'https://www.rakuten.co.jp/category/200990/',
        'https://www.rakuten.co.jp/category/100246/',
        'https://www.rakuten.co.jp/category/201085/',
        'https://www.rakuten.co.jp/category/100268/',
        'https://www.rakuten.co.jp/category/201018/',
        'https://www.rakuten.co.jp/category/100250/',
        'https://www.rakuten.co.jp/category/200911/',
    ];
    let url = "https://www.rakuten.co.jp/category/?l-id=top_normal_gmenu_d_list";

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    try {
        let proxyConfig = {
            host: ip,
            port: port,
        };

        const response = await axios({
            url: url,
            proxy: proxyConfig
        });

        const $ = await cheerio.load(response.data);

        var ii = 0;
        $('.gtc-sectionBase').each((index, element) => {
            $(element).children('.gtc-listTitle').each((i, el) => {
                let nameGroup = $(el).text();
                let group = {};
                group.name_group = nameGroup;

                let subCategories = [];
                $(element).find('div > a > div.gtc-genreUnit__title').each((k, elChildren) => {
                    let info = {};
                    let hrefPrent = $(elChildren).parent().attr('href');
                    if (!categoriesParentIgnore.includes(hrefPrent)) {
                        info.category_name = $(elChildren).text();
                        info.href = hrefPrent;
                        subCategories.push(info);
                        group.category = subCategories;
                    }

                    let arrSubCategories = [];
                    let stt = k + 1;
                    $(element).find('div > div:nth-child(' + stt + ') > div > ul > li > a').each((k, elSub) => {
                        ii++;
                        let hrefChid = $(elSub).attr('href');
                        let subName = $(elSub).text();
                        if (hrefPrent == 'https://www.rakuten.co.jp/category/food/') {
                            if (!subcateIgnore.includes(hrefChid)) {
                                arrSubCategories.push({ 'name': subName, "href": hrefChid, 'cat_id': $(elSub).attr('href').replace(/[^\d]/g, "") });
                            }
                        } else {
                            arrSubCategories.push({ 'name': subName, "href": hrefChid, 'cat_id': $(elSub).attr('href').replace(/[^\d]/g, "") });
                        }

                        info.sub_categories = arrSubCategories;
                    })
                })
                categories.push(group);
            })
        })
        console.log('ii' + ii)

        new SEND({
            status: 200,
            message: "get success!",
            data: categories,
        }).send(res);

    } catch (err) {
        throw new errorResponse.ErrorResponse(err, 500);
    }
}

async function getInfoDetail(req, res) {
    const images = [];
    const url = req.query.url;
    const outStock = "この商品は売り切れです";
    // const url = "https://item.rakuten.co.jp/darkangel/tp2201-3166/?variantId=353080";
    let { browser, page } = await configPuppeteer(url);
    let data = { url_image: images, title: "", price: "" };
    console.log(url)
    try {
        const pageData = await page.evaluate(() => {
            return { html: document.documentElement.innerHTML };
        });
        const $ = await cheerio.load(pageData.html);

        // title 
        data.title = await page.evaluate(() => {
                let titleElement = document.querySelector('.item_name');
                if (titleElement != null) {
                    return titleElement.innerText;
                } else {
                    let titleElement = document.querySelector('.normal_reserve_item_name');
                    return titleElement != null ? titleElement.innerText : "";
                }
            })
            // images
        $('table > tbody > tr > td > span img').each(function(i, e) {
            let src = $(e).attr('src');
            images.push(src);
        })
        $('div .rakutenLimitedId_ImageMain1-3 > img').each(function(i, e) {
            let url_resize = $(e).attr('src');
        })

        // price
        let getPrice = $('#rakutenLimitedId_cart span.price2').text().trim().replace(/[^\d]/g, "");
        if (getPrice == '') {
            getPrice = $('#priceCalculationConfig').attr('data-price');
        }
        data.price = getPrice;

        // desciption
        data.desciption = $('.item_desc').html();

        // cost ship
        const value = await page.evaluate(async() => {
            let tag = document.querySelector('.dsf-detail-link');
            if (tag != null) {
                await tag.click(".dsf-detail-link");
                return document.querySelector('.dsf-selected-prefecture-combo > option:nth-child(1)').value
            }
        })
        await page.waitForTimeout(1000)
        if (value != null) {
            await page.select('.dsf-selected-prefecture-combo', value)
        }
        await page.waitForTimeout(1000)
        let [pathShip] = await page.$x('/html/body/div[14]/div/div[3]/div[1]/div[6]/div/div/div[2]');
        data.cost_shiping = await page.evaluate(el => {
            return el ? el.innerText : '';
        }, pathShip);

        // get variation
        const variationDatas = await page.evaluate(() => {
            let variationData = [];
            let textStock = "売り切れ";

            let tags = document.querySelectorAll('.normal-reserve-skuSelectionArea > div > div > div > div.padding-bottom-small--sgTI2');
            tags.forEach(item => {
                let variation = {};
                let tagLable = item.querySelector('.layout-inline--1ajCj:not(.style-bold600--3yvV_) span')
                if (tagLable != null) {
                    variation.lable = tagLable.textContent;
                }

                let productItem = [];
                let tagItems = item.querySelectorAll('.grid-element--1c5t6');
                tagItems.forEach(e => {
                    let itemElement = e.querySelector('span');
                    if (itemElement != null) {
                        let name = itemElement.innerText;
                        productItem.push({
                            'name': name,
                            'stock': name.includes(textStock) ? 0 : 1
                        });
                        variation.value = productItem;
                    }
                });
                variationData.push(variation);
            });

            return variationData;
        })

        // check sotck 
        let is_stock = true;
        let getStockElement = $('#rakutenLimitedId_aroundCart .text-display--1Iony.type-body--1W5uC.size-medium--JpmnL');
        if (getStockElement != null) {
            let textStock = getStockElement.text().trim();
            if (textStock.includes(outStock)) {
                is_stock = false
            }
        }

        data.variations = variationDatas;
        data.url = url;
        data.is_stock = is_stock;
        // console.dir(variatioDatas, { depth: null });

        await browser.close();
        console.dir(data, { depth: null });

        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (err) {
        await browser.close();
        throw new errorResponse.ErrorResponse(err, 500);
    }

}

async function getListItem(req, res, next) {

    const id = req.query.id || 555089;
    const q = req.query.q || 1;
    const limit = req.query.limit || 100;

    const url = `https://search.rakuten.co.jp/search/mall/-/${id}/?p=${q}`;

    const data = {};
    var list_item = [];
    const total_page = [];
    console.log('catId ' + id)

    try {
        for (let index = 1; index < 20; index++) {
            let ipProxy = configProxy.getIpProxy();
            let urlPager = `https://search.rakuten.co.jp/search/mall/-/${id}/?p=` + index;
            list_item = list_item.concat(await getListItemAxios(urlPager, cheerio, ipProxy));

            console.log(list_item.length);
            if (list_item.length > limit || list_item.length == 0) {
                break;
            }
            await sleep(500);
        }

        data.data = list_item.slice(0, limit);
        data.total_item = list_item.length;
        data.url = url;
        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (err) {
        throw new errorResponse.ErrorResponse(err, 500);
    }
}

async function crawlListItems(page, cheerio) {
    let data = [];
    let pageData = await page.evaluate(() => {
        return {
            html: document.documentElement.innerHTML,
        };
    });

    var $ = await cheerio.load(pageData.html);

    $('.searchresultitems .dui-card.searchresultitem').each((index, element) => {
        let src = $(element).find('img').attr('src');
        let href = $(element).find('.image a').attr('href');
        let title = $(element).find('.content.title a').text();
        let price = $(element).find('.price--OX_YW').text().trim().replace(/[^\d]/g, "");
        let unit_price = $(element).find('.main-price-unit-grid--upFyx').text();
        let score = $(element).find('.dui-rating .score').text();
        let merchant = $(element).find('.content.merchant._ellipsis a').text()
        let link_merchant = $(element).find('.content.merchant._ellipsis a').attr('href')
        data.push({ src, href, title, price, unit_price, score, merchant, link_merchant })
    })

    return data;
}

async function getListItemAxios(url, cheerio, ipProxy) {
    let data = [];
    let [ip, port] = ipProxy.split(":");

    let proxyConfig = {
        host: ip,
        port: port,
    };

    const response = await axios({
        url: url,
        proxy: proxyConfig
    });

    const $ = cheerio.load(response.data);
    console.log('ip' + ip);
    const linkDetailProduct = 'https://item.rakuten.co.jp/';
    const linkDetailProduct_ = 'https://brandavenue.rakuten.co.jp/';
    console.log($('.searchresultitems .dui-card.searchresultitem').length);
    let price = $(element).find('.price--OX_YW').text().trim().replace(/[^\d]/g, "");

    for (const element of $('.searchresultitems .dui-card.searchresultitem')) {
        let link_product = $(element).find('.image a').attr('href');
        console.log('old' + link_product)
        console.log('price' + price)
        if (!link_product.includes(linkDetailProduct) || !(link_product.includes(linkDetailProduct_))) {
            let ipProxys = configProxy.getIpProxy();
            let [ip_, port_] = ipProxys.split(":");
            const responses = await axios({
                url: link_product,
                proxy: {
                    host: ip_,
                    port: port_,
                }
            });
            const P = cheerio.load(responses.data);
            link_product = P("link[rel='canonical']").attr("href");
            console.log('new link_product ' + link_product)
        }
        let src = $(element).find('img').attr('src');
        let href = link_product;
        let title = $(element).find('.content.title a').text();

        let unit_price = $(element).find('.main-price-unit-grid--upFyx').text();
        let score = $(element).find('.dui-rating .score').text();
        let merchant = $(element).find('.content.merchant._ellipsis a').text()
        let link_merchant = $(element).find('.content.merchant._ellipsis a').attr('href')
        data.push({ src, href, title, price, unit_price, score, merchant, link_merchant })
    }

    // console.log(data);

    return data;
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

export default { crawlCategory, getInfoDetail, getListItem, getListItemAxios }