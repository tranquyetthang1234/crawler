import configProxy from "../configs/proxy.js";
import axios from "axios-proxy-fix";
import iconv from "iconv-lite";
import cheerio from "cheerio";
import SEND from "../core/success.response.js"
import errorResponse from "../core/error.response.js"
import configPuppeteer from "../configs/puppeteer.config.js";
import puppeteer from "puppeteer";

async function GetProductDetail(req, res) {
    const url = req.query.url;
    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");
    let stime = performance.now();

    let proxyConfig = {
        host: ip,
        port: port,
    };

    function isEmpty(obj) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }

        return true;
    }


    // const browser = await puppeteer.launch({
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
    //         // `--proxy-server=${ ipProxy }`
    //     ],
    //     browserContext: "default",
    // });

    // const page = await browser.newPage();

    // try {
    //     await page.goto(url, {
    //         waitUntil: "networkidle2",
    //         timeout: 1000
    //     })
    // } catch (error) {
    //     console.log({browser})
    //     await browser.close();
    //     console.log('fails', res)
    //     throw new errorResponse.ErrorResponse(res, 500);
    // }
    // // await page.goto(url, {waitUntil: 'load', timeout: 1000}).then(() => {
    // //     console.log('success')
    // // }).catch(async (res) => {
        
    // // })

    // return {};
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: false,
        headless: false,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-zygote",
            "--single-process",
            "--disable-site-isolation-trials",
            "--disable-features=site-per-process",
            // `--proxy-server=${ ipProxy }`
        ],
        browserContext: "default",
    });

    const page = await browser.newPage();

    try {
        
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 1000
        })

        page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });
        
        // await page.waitForTimeout(1000);
        // await page.setDefaultNavigationTimeout(100000);
        // await page.waitForSelector('body');
        // await page.$x('/html/body');

        // let {browser} = await configPuppeteer(url);
    // console.log({ browser })
    // if (browser ) {
    //     if (browser) {
    //         await browser.close();
    //     }
    //     throw new errorResponse.ErrorResponse("Browser or page Puppeteer dose not exist", 500);
        
    // }
        // const response = await axios({
        //     url: url,
        //     responseType: 'arraybuffer',
        //     proxy: proxyConfig,
        //     timeout: 5000
        // });

        // const dataFormResponse = iconv.decode(Buffer.from(response.data), 'utf-8');

        // const dataFormResponse = await page.evaluate(() => document.querySelector('*').outerHTML);
        // const $ = await cheerio.load(dataFormResponse);
   
        // let genreCategory = $('#item_coupon_first_view_template').next('script[type="text/javascript"]').html();
        // const regexGenreCategory = /genreCategoryIdList\s*:\s*\[([\s\S]*?)\]/;
        // const matchGenreCategory = regexGenreCategory.exec(genreCategory);
     
        // if (matchGenreCategory && matchGenreCategory[1]) {
        //     var jsonArray = matchGenreCategory[1].trim();
        //     genreCategory = JSON.parse("[" + jsonArray + "]");
        // } else {
        //     genreCategory = null;
        // }

        // if (genreCategory != null) {
        //     if (genreCategory.length > 4) {
        //         genreCategory = genreCategory[3];
        //     } else {
        //         genreCategory = genreCategory[genreCategory.length - 1];
        //     }
        // }

        // const shopName = $('.elStore .elStoreName').text();

        // let listImage = [];

        // $('.elThumbnailImage').each(function () {
        //     listImage.push($(this).attr('src'));
        // });

        // let itemId = $('.mdRankingBadge').next('script[type="text/javascript"]').html();
        // const regex = /ysrid\s+:\s+'([^']+)'/;
        // const match = regex.exec(itemId);

        // if (match) {
        //     itemId = match[1];
        // } else {
        //     itemId = null;
        // }

        // let description = $('.mdItemDescription').html() || '';
        // description = description.replaceAll("\n", '');
        // description = description.trim();

        // // listProductVariation
        // const tagHeaders = $('.elTableItem .elTableHeader .elTableWord');
        // let tagHeaderArray = [];
        // let tagArray = [];

        // tagHeaders.each(function () {
        //     let textContent = $(this).text() || '';
        //     textContent = textContent.replaceAll("\n", "").replace(/\s\s+/g, ' ');
        //     textContent = textContent.trim();

        //     if (textContent !== '') {
        //         tagHeaderArray.push(textContent);
        //     }
        // });

        // // elTableStock
        // const tagStock = $('.elTableItem .elTableStock');
        // const tagsFieldA = $('.elTableItem .elTableBody tr .elTableWord');
        // const isOneFieldA = tagsFieldA.length >= tagStock.length;

        // let tags = $('.elTableItem .elTableBody tr');

        // tags.each(function () {
        //     let item = $(this);
        //     let itemTh = item.find('th .elTableWord, td .elTableWord').text();
        //     let listItemTd = item.find('td .elTableStockStateContent');
        //     let listItemTdData = [];
        //     let keyBody = 0;

        //     listItemTd.each(function () {
        //         let itemTd = $(this);
        //         let itemTdValue = itemTd.text();
        //         itemTdValue = itemTdValue.replaceAll("\n", "").replace(/\s\s+/g, ' ').trim();

        //         if (tagHeaderArray[keyBody] && itemTdValue !== '') {
        //             listItemTdData.push(tagHeaderArray[keyBody]);
        //         }

        //         keyBody++;
        //     });

        //     if (isOneFieldA) {
        //         if (Object.keys(listItemTdData).length > 0) {
        //             tagArray.push(itemTh);
        //         }
        //     } else {
        //         if (Object.keys(listItemTdData).length > 0) {
        //             tagArray.push(
        //                 {
        //                     name: itemTh,
        //                     value: listItemTdData
        //                 }
        //             );
        //         }
        //     }
        // });

        // let listProductVariation = {};

        // listProductVariation['field_a'] = tagArray;

        // if (!isOneFieldA) {
        //     listProductVariation['field_b'] = tagHeaderArray;
        //     listProductVariation['field_a_label'] = '商品选项A';
        //     listProductVariation['field_b_label'] = '商品选项B';
        // } else {
        //     if (tagHeaderArray.length >= 3) {
        //         listProductVariation['field_a_label'] = tagHeaderArray[0];
        //     } else {
        //         listProductVariation['field_a_label'] = '商品选项A';
        //     }
        // }
        // // end listProductVariation
       
        // let isStock = $('.elNotice.isEmphasis').text() !== '現在売り切れです' && $('.elAddCart').text().trim() !== '在庫がありません';

        // if (listProductVariation.field_a.length === 0) {
        //     listProductVariation = null;
        // }

        // let priceBase = $('.elOriginalPrice').text();
        // priceBase = priceBase.replace('メーカー希望小売価格', '');
        // priceBase = priceBase.replace('円', '');
        // priceBase = priceBase.replace(',', '');
        // priceBase = parseFloat(priceBase);

        // let price = $('.elPriceNumber[itemprop="price"]').text();
        // price = price.replace(',', '');
        // price = parseFloat(price);

        // if (isNaN(priceBase)) {
        //     priceBase = price;
        // }


        // const elPostageFreeText = $('.elPostageFree').text().trim();
        // let shipping = {};
        // const isHaveDivElCondition = $('.elCondition').length;
        // const elCondition = $('.elCondition p').text();
        // const elPostageText = $('.elPostageText').text();

        // if (elPostageFreeText.search('送料無料') !== -1) {
        //     shipping = {
        //         code: 2,
        //         name: '送料無料'
        //     };
        // } else if (isHaveDivElCondition) {
        //     shipping = {
        //         code: 3,
        //         name: elCondition
        //     };
        // } else if (!isHaveDivElCondition) {
        //     shipping = {
        //         code: 1,
        //         name: elPostageText
        //     };
        // }

        // let productVariationMain = {};

        // if (listProductVariation !== null && listProductVariation.hasOwnProperty('field_a')) {
        //     listProductVariation.field_b = [];

        //     listProductVariation.field_a.forEach(function (itemFieldA) {
        //         if (itemFieldA.hasOwnProperty('value')) {
        //             itemFieldA.value.forEach(function (itemChild) {
        //                 if (itemFieldA.hasOwnProperty('name')) {
        //                     listProductVariation.field_b.push(itemChild);

        //                     if (productVariationMain[itemChild] !== undefined && productVariationMain[itemChild].hasOwnProperty('value')) {
        //                         productVariationMain[itemChild].value.push(itemFieldA.name);
        //                     } else {
        //                         productVariationMain[itemChild] = {
        //                             name: itemChild,
        //                             value: [itemFieldA.name]
        //                         }
        //                     }
        //                 }
        //             });
        //         }
        //     });

        //     if (!isEmpty(listProductVariation.field_b)) {
        //         listProductVariation.field_b = listProductVariation.field_b.filter((x, i, a) => a.indexOf(x) == i);
        //     } else {
        //         listProductVariation.field_b = null;
        //     }

        //     if (!isEmpty(productVariationMain) && listProductVariation !== null) {
        //         listProductVariation.field_a = Object.values(productVariationMain);
        //     }
        // }

        // // add variation 2023-12-19
        // //     {
        // //         title : xxx , 
        // //         value : [
        // //            '【3点セット】',
        // //            '【3点セット】',
        // //            '【3点セット】',
        // //            '【3点セット】',
        // //         ]
        // //     }
        // // ]
        // const listRelatedVariation = [];
      
        // $('.elItemOption.elConfirmation .elItemOptionsDetails.elExpand .elItemOptionsDetail').each(function (index, element) {
        //     const elDetailTitle = $(element).find('.elDetailTitle').text();
        //     if (!elDetailTitle) return;

        //     const infoVariation = {
        //         title: elDetailTitle.trim(),
        //         value: $(element).find('.elChoiceItems .elChoiceItem .elChoiceItemRadio').map(function () {
        //           return $(this).attr('data-sync-cart-confirmation-value-text');
        //         }).toArray()
        //     }

        //     listRelatedVariation.push(infoVariation);
        // });

        // let ftime = performance.now(); 
        // let elapsed_time = ftime - stime;

        // let productInfo = {
        //     itemId,
        //     priceBase,
        //     price,
        //     shopName,
        //     description,
        //     listImage,
        //     genreCategory,
        //     listProductVariation,
        //     isStock,
        //     shipping,
        //     listRelatedVariation,
        //     elapsed_time
        // }

        new SEND({
            status: 200,
            message: "get success!",
            data: productInfo,
        }).send(res);
    } catch (error) {
        const data = { isStock: false };
        // console.log({page})
        await browser.close();

        if (error && error.response && error.response.status == '404') {
            new SEND({
                status: 200,
                message: "get success!",
                data: data,
            }).send(res);
        } else {
            throw new errorResponse.ErrorResponse(error, 500);
        }
    } finally {
        // if (browser && browser.isConnected()) {
        //     await browser.close();
        // }
    }

}

export default { GetProductDetail }