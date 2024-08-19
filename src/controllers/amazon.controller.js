import cheerio from "cheerio"; 
import configPuppeteer from "../configs/puppeteer.config.js"
import errorResponse from "../core/error.response.js"
import SEND from "../core/success.response.js"

async function crawlCategory(req, res) {
    const categories = [];

    let url = "https://www.amazon.co.jp/AmazonGlobal-AmazonJapan/b?ie=UTF8&node=3534638051";

    let { browser, page } = await configPuppeteer(url);

    try {

        const pageData = await page.evaluate(() => {
            return {
                html: document.documentElement.innerHTML,
            };
        });

        const $ = await cheerio.load(pageData.html);

        $(".acswidget .bxc-grid__column .bxc-grid__content--light .bxc-grid__text").each(function (i, e) {
            let group = {};
            if ($(e).find('p img').attr('src') != undefined && $(e).find('h3').text() != " " && $(e).find('h3').text().length > 0 ) {
                let image = $(e).find('p img').attr('src');
                group.name_group = $(e).find('h3').text()
                group.src = image
                categories.push(group);

                let sub_categories = [];
                $(e).find('p a').each(function (k, el) {
                    sub_categories.push({
                        "name": $(el).text(),
                        "href" :$(el).attr('href'),
                    });
                    group.sub_categories = sub_categories;
                });
            }
        })

        await browser.close();
       
        new SEND({
            status: 200,
            message : "get success!",
            data : productInfo,
        }).send(res);
       
    } catch (error) {
        await browser.close();
        throw new errorResponse.ErrorResponse(error.message, 500);
    }
}

async function getInfoDetail(req, res) {
    const url = req.query.url;
    // let url = "https://www.amazon.co.jp/Ouee-%E9%AB%98%E9%BD%A2%E8%80%85%E5%90%91%E3%81%91%E5%A4%A7%E4%BA%BA%E7%94%A8%E7%B4%99%E3%81%8A%E3%82%80%E3%81%A4%E3%83%BB%E5%A4%B1%E7%A6%81-%E5%A4%A7%E4%BA%BA%E7%94%A8%E3%81%8A%E3%82%80%E3%81%A4-A52/dp/B0972CZ85H/ref=sr_1_2_sspa?pf_rd_i=3534638051&pf_rd_m=A3P5ROKL5A1OLE&pf_rd_p=97bfac5a-bcb3-4115-ab86-6033da1c7aa9&pf_rd_r=ATQVSH4AQX9Z7B5Y006M&pf_rd_s=merchandised-search-11&pf_rd_t=101&qid=1678779517&s=specialty-aps&sr=1-2-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyUkRSNkFEU05RNzQ3JmVuY3J5cHRlZElkPUEwMzg1MzY1MjVaNTdXVURRMEoxNSZlbmNyeXB0ZWRBZElkPUEyQU5FS0ZDSDY5R1E1JndpZGdldE5hbWU9c3BfYXRmX2Jyb3dzZSZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    let { browser, page } = await configPuppeteer(url);

    try {
        let productInfo = {}
        let listImages = [];
        let name = await page.evaluate(() => {
            let tagname = document.querySelector('#productTitle');
            if (tagname == null) {
                tagname = document.querySelector('#btAsinTitle');
            }
            return tagname ? tagname.innerText : null;
        })

        listImages = await getImages(page);

        let checkStock = '';
        checkStock = await page.evaluate((a, b) => {
            let tagStock = document.querySelector('#availability')
            let availability = tagStock != null ? tagStock.innerText : null;
          
            let unavailable = 'Currently unavailable';
            let textOutStock = 'out of stock';
            let unavailable_jp = a;
            let outOfStock_jP = b;
          
            if (availability && (availability.includes(unavailable) || availability.includes(textOutStock)
                || availability.includes(unavailable_jp)|| availability.includes(outOfStock_jP) )) {
                return true;
            }

            return false;
        }, 1, 2)

        let prices = [];
        let images = [];
        let elements = listElements();
        prices = await getInfoProduct(page, elements);

        listImages = listImages.map(image => {
            return customUrlImage(image)
        })
        images = [...new Set(listImages)];

        // get variants
        let variationDatas = await getvariationData(page, elements)
        
        console.log(variationDatas); 
        productInfo = {
            'name': name,
            'price': [prices],
            'images': images,
            'is_stock': !checkStock,
            'page': 'amazon',
            'url': url,
            'variations': variationDatas
        }
        await browser.close();
        new SEND({
            status: 200,
            message : "get success!",
            data : productInfo,
        }).send(res);

    } catch (error) {
        console.log("Error : " + error);
        await browser.close();
        throw new errorResponse.ErrorResponse(error.message, 500);
    }
}

async function getvariationData(page, elements) {
    let variationDatas = await page.evaluate((elements) => {
        let variationData = [];
        for (let [i, obj] of elements.entries()) {
            let selectors = document.querySelectorAll(obj.element.replace('.selected','').replace('.swatchSelect', ' '));
            if (selectors.length > 0) {
                selectors.forEach(item => {
                    let objVariants = {};
                    let lable = item.querySelector('.twisterSlotDiv')
                    objVariants.name = lable != null ? lable.innerText.replace(/\r/g, '').replace(/\n/g, '').replaceAll(' ', '').trim(): "";
                    objVariants.stock = i;
                    variationData.push(objVariants)
                })
                return variationData;
            }
        }
        return variationData;
    }, elements)

    return variationDatas;
}

function customUrlImage(image) {
    let arrayImage = image.split('_');
    let arrayImageDot = image.split('.');
    if (arrayImage && arrayImage.length == 4) {
        return arrayImage[0] + arrayImage[3].replace('.', '');
    } else if (arrayImageDot.length > 4) {
        return arrayImageDot[0] + '.' + arrayImageDot[1] + '.' + arrayImageDot[2] + '.' + arrayImageDot[4];
    }

    return image;
}

async function getInfoProduct(page, arrELement) {
    // await page.evaluate(() => { document.querySelector('.twisterSlotDiv').style.display = 'block'; });
    let infoProduct = await page.evaluate((arrELement) => {

        let product = {
            title: '',
            price: '',
            isSelected: false
        }

        function formatCurrency(currency) {
            return currency.replace(/^.*[\\\¥/]/, '').trim().replace(/[^\d]/g, "");
        }
        for (let [i, obj] of arrELement.entries()) {
        // arrELement.forEach(async (obj, i) => {
            let element = document.querySelector(obj.element);
            let setPrice = '';
            let subPrice = '';

            if (element != null) {
                setPrice = element.querySelector(obj.price);
                subPrice = element.querySelector(obj.price_sub);
            }
            if (element != null && (setPrice != null || subPrice != null)) {
                let getTitle = '';
                let getPrice = '';
                let setTitle = element.querySelector(obj.title)

                if (setTitle != null) {
                    getTitle = setTitle.innerText.trim();
                    if (getTitle == null) {
                        getTitle = setTitle.getAttribute('alt');
                    }
                }

                if (setPrice != null) {
                    if (setPrice.textContent != null) {
                        let contentPrice = setPrice.textContent;

                        if (contentPrice.includes('options from') || contentPrice.includes('option from')) {
                            getPrice = contentPrice.substring(contentPrice.lastIndexOf('¥')).replace(/[^\d]/g, "").trim()
                        } else if (contentPrice.includes('(¥')) {
                            getPrice = contentPrice.replace(contentPrice.substring(contentPrice.lastIndexOf('(')).trim(), "").replace(/[^\d]/g, "").trim()
                        } else {
                            getPrice = formatCurrency(contentPrice);
                        }
                    }
                }

                if (getPrice == '' && subPrice != null) {
                    getPrice = formatCurrency(subPrice.textContent);
                }

                product.title = getTitle + i
                product.price = getPrice
                product.element = element
                product.isSelected = true

                return product;
            }
        };

        return product
    }, arrELement)

    return infoProduct;
}

async function getImages(page) {

    let listImages = [];
    let element = await page.evaluate(async () => {
        let arrELement = {
            '.ig-thumb-image img': '.thumb-text.thumb .a-link-normal',
            '#ebooksImgBlkFront': '',
            '#altImages ul li.imageThumbnail img': '',
            '.a-carousel-card.masrw-thumb-card img.masrw-thumbnail': '',
            '.slick-list .slick-track .slick-slide img' : '',
            '#audibleimageblock_feature_div .image-wrapper img' : ''
        }
        for (let keys of Object.keys(arrELement)) {
            let element = document.querySelector(keys);
            let value = arrELement[keys];
            if (value != '') {
                let tag = document.querySelector(value);
                if (tag != null) {
                    await tag.click(value);
                    return keys;
                }
            } else {
                if (element != null) {
                    return keys;
                }
            }

        }

        return null;
    });

    if (element != null) {
        listImages = await page.$$eval(element, images => images.map(image => {
            return image.getAttribute("src")
        }));
    }

    return listImages;
}

function listElements() {
    return [
        {
            'element': '.a-unordered-list.a-nostyle.a-button-list.a-horizontal .swatchElement.selected',
            'title': '.a-button-text span',
            'price': '.audible_mm_price .a-color-price',
            'price_sub': '.a-color-base .a-size-base'
        },
        {
            'element': '.a-unordered-list.a-nostyle.a-button-list.a-horizontal .swatchElement.selected',
            'title': '.a-button-text span',
            'price': '.a-size-base',
            'price_sub': '.a-color-base'
        },
        {
            'element': '.a-unordered-list.a-nostyle.a-button-list.a-horizontal .swatchElement.swatchSelect',
            'title': '.a-button-text span',
            'price': '.a-size-base',
            'price_sub': '.a-color-base'
        },
        {
            'element': '#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare li.swatchSelect',
            'title': '.twisterTextDiv',
            'price': '.twisterSlotDiv .twisterSwatchPrice',
            'price_sub': '.twisterSlotDiv'
        },
        {
            'element': '#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare.imageSwatches li.swatchSelect',
            'title': '.imgSwatch',
            'price': '.olpMessageWrapper',
            'price_sub': 'a'
        },
        {
            'element': '#corePriceDisplay_desktop_feature_div',
            'title': '.a-offscreen',
            'price': '.a-price-whole',
            'price_sub': 'a'
        },
        {
            'element': '#price-block',
            'title': '#actualPriceValue',
            'price': '.priceLarge',
            'price_sub': 'a' 
        },
        {
            'element': '#centerCol.centerColAlign.centerColAlign-bbcxoverride #desktop_unifiedPrice',
            'title': 'a',
            'price': '#priceblock_ourprice',
            'price_sub': 'a'
        },
        {
            'element': '#centerCol.centerColAlign.centerColAlign-bbcxoverride #apex_desktop',
            'title': 'a',
            'price': '#sns-base-price',
            'price_sub': '.a-text-price.apexPriceToPay .a-offscreen'
        },
        {
            'element': '#centerCol.centerColAlign.centerColAlign-bbcxoverride #apex_desktop',
            'title': 'a',
            'price': '.a-text-price.apexPriceToPay .a-offscreen',
            'price_sub': 'a'
        },
        {
            'element': '#apex_desktop #corePrice_desktop',
            'title': 'a',
            'price': '.a-text-price.apexPriceToPay .a-offscreen',
            'price_sub': 'a'
        }
        
    ];
}

export default { crawlCategory, getInfoDetail }