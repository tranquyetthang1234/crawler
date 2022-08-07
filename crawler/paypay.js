const cst = require('../constants.js');

async function crawlerPaypay(url, browser, page, start_cron) {

	try {
		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 0
		})

		await page.waitForTimeout(500);
		await page.setDefaultNavigationTimeout(100000);
		await page.$x('/html/body');

		let [nameXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[1]/div[1]/div[1]/h1');
		let name = await page.evaluate(el => {
			return el ? el.textContent : '';
		}, nameXPath);

		let [priceXPath] = await page.$x('/html/body/div[1]/div/main/div[1]/div[2]/aside/div[1]/div[1]/div[3]/div/div[1]');
		let price = await page.evaluate(el => {
			return el ? el.textContent : '';
		}, priceXPath);


		let checkStock = ''
		checkStock = await page.$$eval('div img', images => images.some(image =>  {
			let sticker = image.getAttribute('alt');
			return sticker == 'sold';
		}));

		let listImages = [];
		if (!start_cron) {
			listImages = await page.$$eval(".slick-slider .slick-list div img", images =>
				images.map(image => {
					return image.getAttribute('src');
				})
			);
		}


		let uniqueImages = [...new Set(listImages)]

		let productInfo = {
			name: name,
			price: price.replace(/[^\d]/g, ""),
			images: uniqueImages,
			is_stock: checkStock,
			url: url,
			page: 'paypay'
		}

		console.log('Product name :' + productInfo.name)

		await browser.close();
		return productInfo;
	} catch (error) {
		await browser.close();
		console.log("Error: " + error);
		return {
			'name': '',
			'url': url,
			'page': 'paypay',
			'error': error.message,
			'message': cst.MSG_ERROR
		}
	}
}

module.exports = crawlerPaypay;