const puppeteer = require('puppeteer');
const fs = require('fs');
const FOLDER_IMAGE = './public/uploads/amazonjp/';
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
async function crawlerAmazon(url) {

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: false,
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-zygote",
            // "--single-process",
            "--disable-site-isolation-trials",
            "--disable-features=site-per-process",
        ],
        browserContext: "default",
    });

    try {
		const page = await browser.newPage();
		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 3000000
		})
		await page.waitForTimeout(1000);
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
        let features = await page.evaluate(() => {
           
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
            return bookDescription != null ? features.innerText : '';
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
        
         
        let productInfo = {
			'name': name,
            'features': features,
			'description': description,
			'price': listPrice1,
			'currency': '¥',
			'images': listImages,
			'is_stock' : checkStock ? false : true,
            'page' : 'amazon'
		}
        console.log('Product name :'+ productInfo.name)
        await browser.close();

        return productInfo;
    } catch (error) {
        console.log("Error : " + error);
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