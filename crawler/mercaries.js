const cst = require('../constants.js');

async function crawlerMercari(url, browser, page, start_cron) {
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
		await page.$x('/html/body/div/div[1]/div/div/div/main/article/div[1]/section/div/div/div/div/div[2]/div/div/div/div/div[4]')

		let name = await page.$$eval("mer-heading.mer-spacing-b-2",
			el => el.map(x => x.getAttribute("title-label"))
		);

		let price = await page.$$eval("mer-price", el =>
			el.map(x => x.getAttribute("value"))
		);

		let checkStock = '';
		checkStock = await page.$$eval('mer-item-thumbnail', images =>
			images.some(image => {
				let sticker = image.getAttribute('sticker');
				return sticker == 'sold';
			}));

		let listImages = [];
		if (!start_cron) {
			listImages = await page.$$eval('.slick-list .slick-track mer-item-thumbnail', images =>
				images.map(image => {
					return image.getAttribute('src');
				})
			);
		}

		let productInfo = {
			'name': name.length && name.length > 0 ? name[0] : '',
			'price': price.length && price.length > 0 ? price[0] : '',
			'images': listImages.filter(el => el != null),
			'is_stock': checkStock,
			'page': 'mercari',
			'url': url
		}

		await browser.close();
		return productInfo;
	} catch (error) {
		console.log("Error: " + error);
		await browser.close();
		return {
			name: '',
			url: url,
			page: 'mercari',
			error: error.message,
			message: cst.MSG_ERROR
		};
	}
};

module.exports = crawlerMercari;