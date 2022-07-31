const puppeteer = require('puppeteer');
const fs = require('fs');
const FOLDER_IMAGE = './public/uploads/ebay/';
const SAVE_IMAGE_TO_FOLDER = false;

async function crawlerEbay(url, browser, page) {

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
	// 		"--disable-site-isolation-trials",
    //         "--disable-features=site-per-process",
    //     ],
    // });

    // const page = await browser.newPage();
    try {
		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		let res = await page.goto(url, {
			waitUntil: "networkidle2",
            timeout: 0
		})
		
        // page.setDefaultNavigationTimeout(0)
		await page.waitForTimeout(500);
		await page.$x('/html/body');

        let [nameXPath] = await page.$x('/html/body/div[5]/div[3]/div/div/div[4]/div[3]/div[1]/div[1]/div/h1');
        let name = await page.evaluate(function (el) {
			return el ? el.textContent : '';
		}, nameXPath);

        let objectPrice = await page.evaluate(function (el) {
			let element = document.querySelector('.mainPrice .notranslate');
			if (element != null) {
				return {
					price : element.getAttribute('content'),
					currency:element.textContent.replace(element.getAttribute('content'), '')
				}
            }
			return { price: null, currency : null };
		});

        let content = '';
		let [contentXPath] = await page.$x('//*[@id="desc_panel"]');
        content = await page.evaluate(function (name) {
			return name ? name.textContent : '';
		}, contentXPath);
        
		let checkStock = false

        let imagesXPath = '/html/body/div[5]/div[3]/div/div/div[3]/div[1]/div'
        let images = await page.$$eval("#vertical-align-items-viewport img", imgs => imgs.map(function (img) {
			let src = img.getAttribute('src').replace('s-l64', 's-l600');
			if(src.includes('.gif') == false) {
				return src;
			}
		}));

		if (name.length == 0) {
			throw new Error('Can not get data');
		}
        let uniqueImages = [...new Set(images)]
        let productInfo = {
			'name': name,
			'description': content,
			'price': objectPrice.price,
			'currency': objectPrice.currency,
			'images': uniqueImages.filter(el => el != null),
			'is_stock' : checkStock ? false : true,
		}
        console.log('Product name :'+ productInfo.name)

		if (SAVE_IMAGE_TO_FOLDER) {
			let dir = FOLDER_IMAGE;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, {
					recursive: true
				});
			}
			for (srcImage of productInfo.images) {
				const pageGoto = await page.goto(srcImage);
				let imageName = dir + srcImage.replace(/^.*[\\\/]/, '');
				fs.writeFile(imageName, await pageGoto.buffer(), function (err) {
					if (err) {
						return console.log(err);
					}
				});
			}
		}

        await browser.close();

        return productInfo;
    } catch (error) {
        console.log("Error : " + error);
		return {
			'name': '',
            'url': url,
            'error': error.message,
            'page' : 'ebay',
			'message' : MSG_ERROR
		};
    }
}

module.exports = crawlerEbay;



