import cheerio from "cheerio";
import puppeteer from "puppeteer";
// import axios from "axios";
import axios from "axios-proxy-fix";
import iconv from "iconv-lite";

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
    let url = "https://item.rakuten.co.jp/kutusitapremium/clma-20230216-37-39/";

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    try {
        let proxyConfig = {
            host: ip,
            port: port,
        };
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8'
        };
        const response = await axios({
            url: url,
            responseType: 'arraybuffer'
                // proxy: proxyConfig,
                // headers
        });
        const data = iconv.decode(Buffer.from(response.data), 'EUC-JP');
        const $ = await cheerio.load(data);
        // const encodedText = '����񿳺���Ԥ��ޤ���\u003cbr\u003e��������ŵ����ˤϾ嵭������Υڡ�������Τ��������ߤ�ɬ�פǤ�';
        // const buffer = Buffer.from($('.normal_reserve_item_name').text(), 'binary');
        // const utf8Text = iconv.decode(buffer, 'win1252').toString('utf8');

        // console.log($("#item-page-app-data").text());
        let dataAPI = JSON.parse($("#item-page-app-data").text());
        let variantSelectorsc = dataAPI.api.data.itemInfoSku.variantSelectors;
        // console.log(variantSelectorsc);
        return 1;
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
async function getva() {


    return browser;
}
async function getInfoDetail(req, res) {
    // const url = req.query.url;
    const outStock = "この商品は売り切れです";
    // const url = "https://item.rakuten.co.jp/f434281-takamori/078-566/";
    const url = "https://item.rakuten.co.jp/kutusitapremium/clma-20230216-37-39/";

    let data = {};

    console.log("url " + url)
    let ipProxyBr = configProxy.getIpProxy();

    // console.log("browser " + browser);
    // let browser = await puppeteer.launch({
    //     ignoreHTTPSErrors: false,
    //     headless: false,
    //     args: [
    //         "--disable-gpu",
    //         "--disable-dev-shm-usage",
    //         "--no-sandbox",
    //         "--disable-setuid-sandbox",
    //         "--no-zygote",
    //         "--single-process",
    //         "--disable-site-isolation-trials",
    //         "--disable-features=site-per-process",
    //         // `--proxy-server=${ ipProxyBr }`
    //     ],
    //     browserContext: "default",
    // });
    try {
        console.time('test');
        // const page = await browser.newPage();
        // await page.setRequestInterception(true);
        // await page.on('request', (request) => {
        //     if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
        //         request.respond({ status: 200, body: 'aborted' })
        //     } else {
        //         request.continue();
        //     }
        // });
        // await page.waitForNavigation({
        //     waitUntil: "domcontentloaded"
        // });

        // await page.setExtraHTTPHeaders({
        //     'Accept-Language': 'en-US,en;q=0.9'
        // });
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');

        // await page.goto(url, {
        //     waitUntil: "networkidle2",
        //     "timeout": 100000
        // })
        // await page.waitForSelector('body');

        // const response = await page.content();
        // const $ = cheerio.load(response);
        const response = await axios({
            url: url,
            responseType: 'arraybuffer',
            // proxy: proxyConfig
            // headers
        });
        const datas = iconv.decode(Buffer.from(response.data), 'EUC-JP');
        const $ = await cheerio.load(datas);

        let variantSelector = null;
        let isVariantion = false
        let attributesCheckbox = [];
        let attributesSelect = [];

        if ($("#item-page-app-data").text() != '') {
            isVariantion = true;
            let dataAPI = JSON.parse($("#item-page-app-data").text());

            variantSelector = dataAPI.api.data.itemInfoSku.variantSelectors;

            let customizationOptions = dataAPI.api.data.itemInfoSku.customizationOptions;;
            let asurakuInfo = dataAPI.api.data.itemInfoSku.sku;
            let variantMappedInventories = dataAPI.api.data.itemInfoSku.purchaseInfo.variantMappedInventories;

            attributesCheckbox = asurakuInfo.map(item => {
                const variant = variantMappedInventories.find(v => v.sku === item.variantId);
                if (item.selectorValues.length > 0) {
                    var parentName = item.selectorValues[0];
                    var childName = item.selectorValues[1];
                } else {
                    var parentName = item.selectorValues[0];
                    var childName = null;
                }

                const quantity = variant ? variant.quantity : 0;
                const isStock = quantity > 0 ? 1 : 0;
                if (quantity > 0) {
                    return {
                        parentName,
                        childName,
                        variantId: item.variantId,
                        quantity,
                        isStock,
                        typeSelect: 1
                    };
                }
            }).filter(Boolean);

            attributesSelect = customizationOptions.map(customOption => {
                return customOption.selections.map(selection => {
                    return {
                        parentName: customOption.key,
                        childName: selection.value,
                        variantId: "1",
                        quantity: 1,
                        isStock: 1,
                        typeSelect: 2
                    };
                });
            }).flat().filter(Boolean);

        }

        // check sotck 
        let is_stock = true;
        let getStockElement = $('#rakutenLimitedId_aroundCart .text-display--1Iony.type-body--1W5uC.size-medium--JpmnL');
        if (getStockElement != null) {
            let textStock = getStockElement.text().trim();
            if (textStock.includes(outStock)) {
                is_stock = false
            }
        }

        data.variantSelectors = variantSelector;
        data.attributes = [...attributesCheckbox, ...attributesSelect];
        data.isVariantion = isVariantion;
        data.is_stock = is_stock;

        console.timeEnd('test');
        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (error) {
        throw new errorResponse.ErrorResponse(error, 500);
    }
}


async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

export default { crawlCategory, getInfoDetail }