const puppeteer = require('puppeteer');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')

const crawlerMercari = require('./crawler/mercaries');
const crawlerPaypay = require('./crawler/paypay');
const crawlerAmazon = require('./crawler/amazonjp');
const crawlerEbay = require('./crawler/ebay');
const { getIpProxy, getUserAgents } = require('./proxy/index');
const cst = require('./constants.js');

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());
app.use(cors())


async function test() {
	// let proxyIP = getIpProxy();
	
	let proxyIP = '160.16.62.47:3128';
	const browser = await puppeteer.launch({
		headless: false,
		args: [ 
			`--proxy-server=${ proxyIP }`,
			'--ignore-certificate-errors',
			'--ignore-certificate-errors-spki-list '
		]
	});
	let uerAgent = getUserAgents();
	console.log('uerAgent ' + uerAgent)
	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();
	// await page.setUserAgent(uerAgent);
	const pageUrl = 'https://www.ipaddress.my/';

	await page.goto(pageUrl, {
		waitUntil: "networkidle2",
		timeout: 0
	});
}
// test();

async function main(params, suppliername) {
	process.setMaxListeners(0);
	let proxyIP = suppliername == 'paypay' ? '' : getIpProxy();
	// let proxyIP = '160.16.62.47:3128';

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
			// "--proxy-server=140.83.37.54:80"
		],
		browserContext: "default",
	});
	console.log('IP Proxy ' + proxyIP)
	const page = await browser.newPage();
	await page.setUserAgent(getUserAgents());
	let product = [];
	let url = params.supplierval || '';
	let start_cron = params.start_cron || '';
	
	switch (suppliername) {
		case 'amazon':
			console.log("========== Start crawler page amazon! ==========");
			product = await crawlerAmazon(url, browser, page, start_cron);
			break;
		case 'paypay':
			console.log("========== Start crawler page paypay! ==========");
			product = await crawlerPaypay(url, browser, page, start_cron);
			break;
		case 'mercari':
			console.log("========== Start crawler page mercari! ==========");
			product = await crawlerMercari(url, browser, page, start_cron);
			break;
		default:
			console.log("========== Start crawler page ebay! ==========");
			product = await crawlerEbay(url, browser, page, start_cron);
			break;
	}

	return product;
}

app.get('/', async (req, res) => {
	await res.send("Test server is running success!")
})

app.get('/search', async (req, res) => {

	let search = req.query;
	let url = search.supplierval || '';
	let checkUrl = false;
	let suppliername = 'ebay';
	let listPages = cst.LIST_PAGE_CRAWLER
	let response = [];
	
	try {

		for (let k of Object.keys(listPages)) {
			if (url.includes(listPages[k]) && !checkUrl) {
				checkUrl = true;
				suppliername = k;
			}
		}

		if (!checkUrl) {
			throw new Error('Url is not valid ' + url);
		}
	
		response = await main(search, suppliername);

	} catch (error) {
		console.dir('Error: ' + error);
		return await res.json({
			status: false,
			data: {},
			error: error.message,
			message: cst.MSG_ERROR
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