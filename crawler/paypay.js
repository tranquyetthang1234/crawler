const puppeteer = require('puppeteer');
const fs = require('fs');
const FOLDER_IMAGE = './public/uploads/paypay/';
const SAVE_IMAGE_TO_FOLDER = false;

async function crawlerPaypay(url) {

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: false,
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-zygote",
            "--single-process",
			"--disable-site-isolation-trials",
            "--disable-features=site-per-process",
        ],
    });
    try {
		const page = await browser.newPage();
		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		await page.goto(url, {
			waitUntil: "networkidle2",
			// timeout: 3000000
		})

		await page.waitForTimeout(3000);
		await page.$x('/html/body');

        let [priceXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[1]/div[3]/div/div[1]');
        let price = await page.evaluate(function (el) {
			return el ? el.textContent : '';
		}, priceXPath);

        let [nameXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[1]/div[1]/div[1]/h1');
        let name = await page.evaluate(function (el) {
			return el ? el.innerHTML : '';
		}, nameXPath);
        
        let desc = '';
		let [descriptionXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[4]/aside/div[1]/div');
        desc = await page.evaluate(function (name) {
			return name ? name.textContent : '';
		}, descriptionXPath);

        if(desc == '' || desc == null) {
            let [descriptionXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[3]/aside/div[1]/div');
            desc = await page.evaluate(function (name) {
                return name ? name.textContent : '';
            }, descriptionXPath);
        }
        let checkStock = false
        checkStock = await page.$$eval('div img', imgs => imgs.some(function (img) {
			let sticker = img.getAttribute('alt');
			return sticker == 'sold';
		}));

        let images = await page.$$eval(".slick-slider .slick-list div img", imgs => imgs.map(function (img) {
			let src = img.getAttribute('src');
			return src;
		}));
		
        let uniqueImages = [...new Set(images)]

        let productInfo = {
			'name': name,
			'description': desc,
			'price': price.replace(/[^\d]/g, ""),
			'currency': '円',
			'images': uniqueImages,
			'is_stock' : checkStock ? false : true
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
    }
}

module.exports = crawlerPaypay;



