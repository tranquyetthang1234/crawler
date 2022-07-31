const puppeteer = require('puppeteer');
const fs = require('fs');
const FOLDER_IMAGE = './public/uploads/amazonjp/';
const SAVE_IMAGE_TO_FOLDER = false;

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

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
        await page.waitForSelector('body');
		await page.$x('/html/body');
       
        let listImages = [];
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
            let className = '#altImages ul li.imageThumbnail  img'
            let element = document.querySelector(className);
            if (element != null) {
                return className;
            }
            return false;
        })


        if (checkExistListImage_1 != false) {
            listImages = await page.$$eval(checkExistListImage_1, el => el.map(function(x) {
                return x.getAttribute("src")
            }));
        } else if(checkExistListImage_2 != false) {
            listImages = await page.$$eval(checkExistListImage_2, el => el.map(function(x) {
                return x.getAttribute("src")
            }));
        } else if (checkExistListImage_3) {
            listImages = await page.$$eval(checkExistListImage_3, el => el.map(function(x) {
                return x.getAttribute("src")
            }));
        }
       
        let name = await page.evaluate(() => {
            let tagname = document.querySelector('#productTitle');
            return tagname ? tagname.innerText : null;
        })

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

        // let images = await page.evaluate(() => {
        //     let features = document.querySelector('#imgTagWrapper src');
        //     return features != null ? features.innerText : null;
        // })
        
        let checkStock = false;
            checkStock = await page.evaluate(() => {
                let tagStock = document.querySelector('#availability')
                let availability = tagStock != null ? tagStock.innerText : null; 
                let text = 'Currently unavailable';
                let textOutStock = 'out of stock';
                if(availability && (availability.includes(text) || availability.includes(textOutStock))  ) {
                    return true;
                }

                return false;
            })

        
        let listPrice1 = [];
        listPrice1 = await page.evaluate(() => {
            let ulz = document.querySelectorAll('#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare.imageSwatches li');
            listPrices = Array.from(ulz)
            return listPrices.map(function(price) {
                let isSelected = false;
                let imgTag = price.querySelector('.imgSwatch');
                let title = imgTag.getAttribute('alt');
                let urlImage = imgTag.getAttribute('src');
                let priTag = price.querySelector('.olpMessageWrapper');
                let priceItem = priTag ? priTag.textContent.replace(/^.*[\\\¥/]/, '').trim() : '';
                if (price.matches('.swatchSelect')) {
                    isSelected = true;
                }

                let arrayImage = urlImage.split('_');
                if(arrayImage && arrayImage.length == 3) {
                    urlImage = arrayImage[0] + arrayImage[2].replace('.', '');
                }
                
                return {
                    title : title,
                    url : urlImage,
                    price : priceItem.replace(/[^\d]/g, ""),
                    currency: priceItem ? '¥' : '',
                    isSelected : isSelected
                };
            })
        })

        if(listPrice1.length == 0) {
            listPrice1 = await page.evaluate(() => {
                let ul = document.querySelectorAll('.a-unordered-list.a-nostyle.a-button-list.a-horizontal .swatchElement');
                listPrices = Array.from(ul)
                return listPrices.map(function(price) {
                    let isSelected = false;
                    let title = price.querySelector('.a-button-text span').textContent;
                    let priTag = price.querySelector('.a-size-base');
                    let priceItem = priTag != null ? priTag.textContent.replace(/^.*[\\\¥/]/, '').trim() : '';
                    if (price.matches('.swatchSelect')) {
                        isSelected = true;
                    }
                    return {
                        title : title,
                        url : null,
                        price : priceItem.replace(/[^\d]/g, ""),
                        currency: priceItem ? '¥' : '',
                        isSelected: isSelected
                    };
                })
            })
        }
        listImages = listImages.map((image) => {
            return changeUrlImage(image)
        })

        if (name.length == 0) {
			throw new Error('Can not get data');
		}
         
        productInfo = {
			'name': name,
            'features': features,
			'description': description,
			'price': listPrice1,
			'currency': listPrice1 ? '¥' : '',
			'images': listImages,
			'is_stock' : checkStock ? false : true,
            'page' : 'amazon',
            'url': url
		}
        console.log('Product name :'+ productInfo.name)

        return productInfo;
    } catch (error) {
        console.log("Error : " + error);
        return {
            'name': '',
            'url': url,
            'page' : 'amazon',
            'error': error.message,
            'message' : MSG_ERROR
        };
    }
}

function changeUrlImage(image) {
    let arrayImage = image.split('_');
    if(arrayImage && arrayImage.length == 4) {
        return arrayImage[0] + arrayImage[3].replace('.', '');
    }
    return image;
}

module.exports = crawlerAmazon;