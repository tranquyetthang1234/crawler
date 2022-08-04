const MSG_ERROR = '商品情報が取得出来ませんでした。仕入先URLを再度確認してください。';

async function crawlerAmazon(url, browser, page) {

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
            return tagname ? tagname.innerText : null;
        })

        if (name && name.length == 0) {
            throw new Error('Can not get data, product name does not exit');
        }

        // get images 
        let checkExistListImage_1 = await page.evaluate(async () => {
            let className = '.thumb-text.thumb .a-link-normal'
            let element = document.querySelector(className);
            if (element != null) {
                await element.click(className);
                return '.ig-thumb-image img';
            }
            return false;
        })

        let checkExistListImage_2 = await page.evaluate(async () => {
            let className = '#ebooksImgBlkFront'
            let element = document.querySelector(className);
            if (element != null) {
                return className;
            }
            return false;
        })

        let checkExistListImage_3 = await page.evaluate(async () => {
            let className = '#altImages ul li.imageThumbnail img'
            let element = document.querySelector(className);
            if (element != null) {
                return className;
            }
            return false;
        })


        if (checkExistListImage_1 != false) {
            listImages = await page.$$eval(checkExistListImage_1, el => el.map(function (x) {
                return x.getAttribute("src")
            }));
        } else if (checkExistListImage_2 != false) {
            listImages = await page.$$eval(checkExistListImage_2, el => el.map(function (x) {
                return x.getAttribute("src")
            }));
        } else if (checkExistListImage_3) {
            listImages = await page.$$eval(checkExistListImage_3, el => el.map(function (x) {
                return x.getAttribute("src")
            }));
        }

        /* Get product features */
        let features = '';
        features = await page.evaluate(() => {

            let features = document.querySelectorAll('#feature-bullets ul li');
            let formattedFeatures = [];

            features.forEach((feature) => {
                formattedFeatures.push(feature.textContent);
            });

            return formattedFeatures.join('');
        })

        let description = '';
        description = await page.evaluate(() => {
            let bookDescription = document.querySelector('#bookDescription_feature_div div');
            return bookDescription != null ? bookDescription.innerText : '';
        })

        let checkStock = false;
        checkStock = await page.evaluate(() => {
            let tagStock = document.querySelector('#availability')
            let availability = tagStock != null ? tagStock.innerText : null;
            let text = 'Currently unavailable';
            let textOutStock = 'out of stock';
            if (availability && (availability.includes(text) || availability.includes(textOutStock))) {
                return true;
            }

            return false;
        })


        let listPrice1 = [];

        listPrice1 = await page.evaluate(() => {
            let element = document.querySelectorAll('#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare.imageSwatches li');
            listPrices = Array.from(element)
            return listPrices.map(function (price) {
                let isSelected = false;
                let imgTag = price.querySelector('.imgSwatch');
                let urlImage = imgTag.getAttribute('src');
                let title = imgTag.getAttribute('alt');
                let priTag = price.querySelector('.olpMessageWrapper');
                let priceItem = priTag ? priTag.textContent.replace(/^.*[\\\¥/]/, '').trim() : '';
                if (price.matches('.swatchSelect')) {
                    isSelected = true;
                }

                return {
                    title: title + '1',
                    price: priceItem.replace(/[^\d]/g, ""),
                    currency: priceItem ? '¥' : '',
                    isSelected: isSelected
                };

            })
        })

        if (listPrice1 && listPrice1.length == 0) {
            listPrice1 = await page.evaluate(() => {
                let ul = document.querySelectorAll('.a-unordered-list.a-nostyle.a-button-list.a-horizontal .swatchElement');
                listPrices = Array.from(ul)
                return listPrices.map(function (price) {
                    let isSelected = false;
                    let title = price.querySelector('.a-button-text span').textContent.trim();
                    let priTag = price.querySelector('.a-size-base');
                    let priceItem = priTag != null ? priTag.textContent.replace(/^.*[\\\¥/]/, '').trim() : '';
                    if (price.matches('.swatchSelect') || price.matches('.selected')) {
                        isSelected = true;
                    }
                    return {
                        title: title + '2',
                        url: null,
                        price: priceItem.replace(/[^\d]/g, ""),
                        currency: priceItem ? '¥' : '',
                        isSelected: isSelected
                    };
                })
            })
        }

        if (listPrice1 && listPrice1.length == 0) {
            listPrice1 = await page.evaluate(() => {
                let element = document.querySelectorAll('#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare li');
                return Array.from(element).map(function (price) {
                    let isSelected = false;
                    let title = price.querySelector('.twisterTextDiv').innerText.trim();
                    let priTag = price.querySelector('.twisterSlotDiv');
                    let priceItem = priTag ? priTag.textContent.trim() : '';
                    if (price.matches('.swatchSelect')) {
                        isSelected = true;
                    }
                    
                    return {
                        title: title + '3',
                        price: priceItem.substring(priceItem.lastIndexOf('¥')).replace(/[^\d]/g, ""),
                        currency: priceItem ? '¥' : '',
                        isSelected: isSelected
                    };

                })
            })
        }

        let infoItemProduct = listPrice1.filter(el => el != null);

        listImages = listImages.map((image) => {
            return customUrlImage(image)
        })

        productInfo = {
            'name': name,
            'features': features,
            'description': description,
            'price': infoItemProduct,
            'currency': listPrice1 ? '¥' : '',
            'images': listImages,
            'is_stock': checkStock ? false : true,
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
            'message': MSG_ERROR
        };

    }
}

function customUrlImage(image) {
    let arrayImage = image.split('_');
    let arrayImageDot = image.split('.');
    if (arrayImage && arrayImage.length == 4) {
        return arrayImage[0] + arrayImage[3].replace('.', '');
    } else if (arrayImageDot.length > 4) {
        return arrayImageDot[0]  + '.' + arrayImageDot[1] + '.' + arrayImageDot[2] + '.'+ arrayImageDot[4];
    }
 
    return image;
}

module.exports = crawlerAmazon;