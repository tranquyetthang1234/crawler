const puppeteer = require('puppeteer');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')

const crawlerMercari = require('./crawler/mercaries');
const crawlerPaypay = require('./crawler/paypay');
const crawlerAmazon = require('./crawler/amazonjp');
const crawlerEbay = require('./crawler/ebay');
const getIpProxy = require('./proxy/index');

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());
app.use(cors())

const MSG_ERROR = '商品情報が取得出来ませんでした。仕入先URLを再度確認してください。';

async function run() {
	// let proxyIP = getIpProxy();
	let proxyIP = '140.227.59.167:3180';
	const browser = await puppeteer.launch({
		headless: false,
		args: [ 
			`--proxy-server=${ proxyIP }`,
			'--ignore-certificate-errors',
			'--ignore-certificate-errors-spki-list '
		]
	});
	console.log('IP Proxy ' + proxyIP)
	
	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();
	const pageUrl = 'https://www.ipaddress.my/';

	await page.goto(pageUrl, {
		waitUntil: "networkidle2",
		timeout: 0
	});

}

// run();
async function main(params, suppliername) {
	process.setMaxListeners(0);
	let proxyIP = suppliername == 'paypay' ? '' : getIpProxy();
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: false,
		headless: false,
		args: [
			"--disable-gpu",
			"--disable-dev-shm-usage",
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--no-zygote",
			"--single-process",
			"--disable-site-isolation-trials",
			"--disable-features=site-per-process",
			`--proxy-server=${ proxyIP }`
		],
		browserContext: "default",
	});
	console.log('IP Proxy ' + proxyIP)
	const page = await browser.newPage();
	// await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
	let product = [];
	let url = params.supplierval || '';

	switch (suppliername) {
		case 'amazon':
			console.log("========== Start crawler page amazon! ==========");
			product = await crawlerAmazon(url, browser, page);
			break;
		case 'paypay':
			console.log("========== Start crawler page paypay! ==========");
			product = await crawlerPaypay(url, browser, page);
			break;
		case 'mercari':
			console.log("========== Start crawler page mercari! ==========");
			product = await crawlerMercari(url, browser, page);
			break;
		default:
			console.log("========== Start crawler page ebay! ==========");
			product = await crawlerEbay(url, browser, page);
			break;
	}

	return product;
}

app.get('/', async (req, res) => {
	console.log(req.socket.remoteAddress);
	await res.send("Test server is running success!")
})

app.get('/search', async (req, res) => {

	let search = req.query;
	let response = [];
	let listPages = {
		paypay : 'paypayfleamarket.yahoo.co.jp',
		mercari : 'jp.mercari.com',
		amazon : 'amazon.co.jp',
		ebay : 'ebay.com'
	}
	
	let url = search.supplierval || '';
	let checkUrl = false;
	let suppliername = 'ebay';
	
	try {

		for (let k of Object.keys(listPages)) {
			if (url.includes(listPages[k]) && !checkUrl) {
				checkUrl = true;
				suppliername = k;
			}
		}

		if (!checkUrl) {
			throw new Error('Url invalid ' + url);
		}
	
		response = await main(search, suppliername);

	} catch (error) {
		console.dir('Error: ' + error);

		return await res.json({
			status: false,
			data: {},
			error: error.message,
			message: MSG_ERROR
		});
	}

	console.dir(response, {
		depth: null
	});

	return await res.json({
		status: true,
		data: response,
		message: ''
	});
})

app.listen(PORT, () => {
	console.log(`Server is running on PORT ${PORT}`);
});