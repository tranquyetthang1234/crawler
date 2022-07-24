const puppeteer = require('puppeteer');
const fs = require('fs');
const FOLDER_IMAGE = './public/uploads/mercari/';
const SAVE_IMAGE_TO_FOLDER = false;

async function crawlerMercari(url, browsers) {
	try { 
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
		});

		const page = await browser.newPage();

		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 3000000
		})

		await page.waitForTimeout(1000);
		await page.$x('/html/body');
		await page.$x('/html/body/div/div[1]/div/div/div/main/article/div[1]/section/div/div/div/div/div[2]/div/div/div/div/div[4]')
		let [descriptionXPath] = await page.$x('/html/body/div/div[1]/div/div/div/main/article/div[2]/section[2]/mer-show-more');

		let name = await page.$$eval("mer-heading.mer-spacing-b-2", el => el.map(x => x.getAttribute("title-label")));
		let price = await page.$$eval("mer-price", el => el.map(x => x.getAttribute("value")));
		
		let checkStock = false;
		checkStock = await page.$$eval('mer-item-thumbnail', imgs => imgs.some(function (img) {
			let sticker = img.getAttribute('sticker');
			return sticker == 'sold';
		}));

		let images = await page.$$eval('.slick-list .slick-track mer-item-thumbnail', imgs => imgs.map(function (img) {
			let src = img.getAttribute('src');
			return src;
			// let url = 'https://static.mercdn.net/item/detail';
			// if (src.includes(url)) {
			// 	return src;
			// }
		}));

		let desc = await page.evaluate(function (name) {
			return name ? name.textContent : '';
		}, descriptionXPath);
		
		let productInfo = {
			'name': name.length && name.length > 0 ? name[0] : '',
			'description': desc,
			'price': price.length && price.length > 0 ? price[0] : '',
			'currency': '¥',
			'images': images.filter(el => el != null),
			'is_stock' : checkStock ? false : true
		}
		
		if (SAVE_IMAGE_TO_FOLDER) {
			let dir = FOLDER_IMAGE;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, {
					recursive: true
				});
			}
			for (srcImage of productInfo.images) {
				const pageGoto = await page.goto(srcImage);
				let imageName = dir + srcImage.substring(0, srcImage.indexOf('?')).replace(/^.*[\\\/]/, '');
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
        console.log("Error: " + error);
    }
};

module.exports = crawlerMercari;