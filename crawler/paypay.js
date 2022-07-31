const MSG_ERROR = '商品情報が取得出来ませんでした。仕入先URLを再度確認してください。';

async function crawlerPaypay(url, browser, page) {
    
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
			return img.getAttribute('src');
		}));


		if (name.length == 0) {
			throw new Error('Can not get data');
		}
		
        let uniqueImages = [...new Set(images)]

        let productInfo = {
			'name': name,
			'description': desc,
			'price': price.replace(/[^\d]/g, ""),
			'currency': name ? '円': '',
			'images': uniqueImages,
			'is_stock' : checkStock ? false : true,
			'url' : url,
			'page' : 'paypay'
		}
        console.log('Product name :'+ productInfo.name)

        await browser.close();

        return productInfo;
    } catch (error) {
        await browser.close();
        console.log("Error: " + error);
		return {
			'name': '',
			'url': url,
			'page' : 'paypay',
			'error': error.message,
			'message' : MSG_ERROR
		}
    }
}

module.exports = crawlerPaypay;



