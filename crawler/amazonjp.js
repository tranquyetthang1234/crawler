const cst = require('../constants.js');


async function crawlerAmazon(url, browser, page, start_cron) {

    try {
        let productInfo = {}
        page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 0
        })
        await page.waitForTimeout(500);
        await page.setDefaultNavigationTimeout(100000);

        await page.waitForSelector('body');
        await page.$x('/html/body');

        let listImages = [];

        let name = await page.evaluate(() => {
            let tagname = document.querySelector('#productTitle');
            if (tagname == null) {
                tagname = document.querySelector('#btAsinTitle');
            }
            return tagname ? tagname.innerText : null;
        })

        if (!start_cron) {
            listImages = await getImages(page);
        }

        let checkStock = '';
        checkStock = await page.evaluate(() => {
            let tagStock = document.querySelector('#availability')
            let availability = tagStock != null ? tagStock.innerText : null;
            let unavailable = 'Currently unavailable';
            let textOutStock = 'out of stock';
            let unavailable_jp = cst.UNAVAILABLE;
            let outOfStock_jP = cst.OUT_OF_STOCK;
            if (availability && (availability.includes(unavailable) || availability.includes(textOutStock)
                || availability.includes(unavailable_jp)|| availability.includes(outOfStock_jP) )) {
                return true;
            }

            return false;
        })

        let prices = [];
        let images = [];
        prices = await getInfoProduct(page);

        listImages = listImages.map(image => {
            return customUrlImage(image)
        })
        images = [...new Set(listImages)];
        productInfo = {
            'name': name,
            'price': [prices],
            'images': images,
            'is_stock': checkStock,
            'page': 'amazon',
            'url': url
        }
        console.log('Product name :' + productInfo.name)

        await browser.close();
        return productInfo;

    } catch (error) {
        console.log("Error : " + error);
        await browser.close();
        return {
            'name': '',
            'url': url,
            'page': 'amazon',
            'error': error.message,
            'message': cst.MSG_ERROR
        };

    }
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

async function getInfoProduct(page) {
    // await page.evaluate(() => { document.querySelector('.twisterSlotDiv').style.display = 'block'; });
    infoProduct = await page.evaluate(() => {

        let arrELement = [{
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
            }
        ];

        let product = {
            title: '',
            price: '',
            isSelected: false
        }

        function formatCurrency(currency) {
            return currency.replace(/^.*[\\\¥/]/, '').trim().replace(/[^\d]/g, "");
        }
        arrELement.forEach(async (obj, i) => {
            let element = document.querySelector(obj.element);
            if (element != null) {
                let getTitle = '';
                let getPrice = '';

                let setTitle = element.querySelector(obj.title)
                let setPrice = element.querySelector(obj.price);
                let subPrice = element.querySelector(obj.price_sub);

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
        });

        return product
    })

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
            '.slick-list .slick-track .slick-slide img' : ''
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

module.exports = crawlerAmazon;