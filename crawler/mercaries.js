const MSG_ERROR = '商品情報が取得出来ませんでした。仕入先URLを再度確認してください。';

async function crawlerMercari(url, browser, page) {
	try { 
		
		page.waitForNavigation({
			waitUntil: "domcontentloaded"
		});

		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 0
		})
		
		await page.waitForTimeout(500);
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
			return img.getAttribute('src');
		}));

		let desc = await page.evaluate(function (name) {
			return name ? name.textContent : '';
		}, descriptionXPath);
		
		if (name.length == 0) {
			throw new Error('Can not get data');
		}
		
		let productInfo = {
			'name': name.length && name.length > 0 ? name[0] : '',
			'description': desc,
			'price': price.length && price.length > 0 ? price[0] : '',
			'currency': price ? '¥' : '',
			'images': images.filter(el => el != null),
			'is_stock' : checkStock ? false : true,
			'page' : 'mercari',
            'url': url
		}
 		
		await browser.close();
		return productInfo;
	} catch (error) {
        console.log("Error: " + error);
		await browser.close();
        return {
			'name': '',
			'url': url,
			'page' : 'mercari',
			'error': error.message,
			'message' : MSG_ERROR
		};
    }
};

module.exports = crawlerMercari;