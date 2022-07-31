const puppeteer = require('puppeteer');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const request = require('request')

const crawlerMercari = require('./crawler/mercaries.js');
const crawlerPaypay = require('./crawler/paypay.js');
const crawlerAmazon = require('./crawler/amazonjp.js');
const crawlerEbay = require('./crawler/ebay.js');
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());
app.use(cors())

const MSG_ERROR = '商品情報が取得出来ませんでした。仕入先URLを再度確認してください。';

async function test() {
	process.setMaxListeners(0);

	let mercaries = [
		// 'https://jp.mercari.com/item/m45592810551',
		// 'https://jp.mercari.com/item/m41991893875',
		// 'https://jp.mercari.com/item/m96339162315',
		// 'https://jp.mercari.com/item/m21778475712',
		// 'https://jp.mercari.com/item/m74416333553',
		// 'https://jp.mercari.com/item/m86269325610',
		'https://jp.mercari.com/item/m79788841414'
	];

	let paypays = [
		'https://paypayfleamarket.yahoo.co.jp/item/z150687138',
		'https://paypayfleamarket.yahoo.co.jp/item/z146447822',
		'https://paypayfleamarket.yahoo.co.jp/item/z151746480'
	]

	let amazonList = [
		// 'https://whatismyipaddress.com/',
		'https://www.amazon.co.jp/-/en/%E3%83%99%E3%82%B9%E3%83%88%E3%82%AB%E3%83%BC%E7%B7%A8%E9%9B%86%E9%83%A8-ebook/dp/B09XDS3BNM/ref=tmm_kin_swatch_0?_encoding=UTF8&qid=&sr=',
		// 'https://www.amazon.co.jp/-/en/TL-SG1005P-Switching-Compatible-Unmanaged-Connector/dp/B09V5S8RR5/ref=lp_2151992051_1_2',
		// 'https://stackoverflow.com/questions/40884153/try-catch-blocks-with-async-await',
		// 'https://www.amazon.cso.jp/-/en/Keyboard-HUAWEI-MatePad-Tablet-Model/dp/B098DC1BPG/ref=lp_2152014051_1_8',
		// 'https://www.amazon.co.jp/-/en/Artificial-Decorative-Flowers-Wisteria-Decoration/dp/B07H4CHN41',
		// 'https://www.amazon.co.jp/-/en/Artificial-Decorative-Flowers-Wisteria-Decoration/dp/B07GFC8T8B/ref=lp_306192011_1_1',
		// 'https://www.amazon.co.jp/-/en/%E8%8F%85%E5%8E%9F-%E9%A0%86%E4%BA%8C/dp/4415329128',
		// 'https://www.amazon.co.jp/-/en/driver%E7%B7%A8%E9%9B%86%E9%83%A8/dp/B0B2HX137H/',
		// 'https://www.amazon.co.jp/-/en/driver%E7%B7%A8%E9%9B%86%E9%83%A8-ebook/dp/B09HK89D1L/',
		// 'https://www.amazon.co.jp/-/en/DVD-Included-First-Pilates-Program/dp/4023332488?ref_=Oct_d_orec_d_2133609051&pd_rd_w=8YgkD&content-id=amzn1.sym.9a5d1d25-7c29-4a0d-b321-a87f77ef3dba&pf_rd_p=9a5d1d25-7c29-4a0d-b321-a87f77ef3dba&pf_rd_r=MN3DHSKQW88X4HN34DDK&pd_rd_wg=mNvCj&pd_rd_r=5b306596-3b58-4f91-8252-121d13bd9020&pd_rd_i=4023332488',
		// 'https://www.amazon.com/Garden-Life-Complex-Folate-Supplement/dp/B016O9H98Q/ref=sr_1_3?keywords=B-life%2F&qid=1658397151&sr=8-3',
		// 'https://www.amazon.co.jp/-/en/B-life/dp/4408339156/ref=pd_vtp_sccl_2_1/357-3462904-6492628?pd_rd_w=kc5ee&content-id=amzn1.sym.cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_p=cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_r=GV1A8WZZ9PCX7E4QBFMJ&pd_rd_wg=GCTUU&pd_rd_r=86b686ae-3f87-409b-b21c-79d231f147e3&pd_rd_i=4408339156&psc=1',
		// 'https://www.amazon.co.jp/dp/B095Y64D77/ref=syn_sd_onsite_desktop_117?ie=UTF8&psc=1&pd_rd_plhdr=t',
		// 'https://www.amazon.co.jp/-/en/dp/B09XYXQ3NP/ref=pd_vtp_sccl_2_5/357-3462904-6492628?pd_rd_w=EMAfq&content-id=amzn1.sym.cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_p=cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_r=KQYRFBS10EXXFH4FKCBZ&pd_rd_wg=kzssj&pd_rd_r=11838ff8-9588-479f-80eb-992fea3a4803&pd_rd_i=B09XYXQ3NP&psc=1',
		// 'https://www.amazon.co.jp/dp/B00KBJEQUU?ref_=ast_sto_dp&th=1&psc=1',
		// 'https://www.amazon.co.jp/-/en/dp/B09YTZ6YPD/ref=sr_1_4?keywords=car&qid=1658386932&sr=8-4',
		// 'https://www.amazon.co.jp/B-life/dp/4408339156/ref=pd_vtp_sccl_2_7/357-3462904-6492628?pd_rd_w=5rD65&content-id=amzn1.sym.cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_p=cbb45385-7b99-44b7-a528-bff5ddaa153d&pf_rd_r=0396XE5YKZDNZRHAVWS9&pd_rd_wg=e4nI8&pd_rd_r=08f23a69-c774-4adc-ae7e-ac5bf52a3f04&pd_rd_i=4408339156&psc=1'
	];

	// console.log("========== Start crawler page mercari! ==========");
	// const productsMercari = await Promise.all(mercaries.map(mercari => crawlerMercari(mercari)));
	// console.log(productsMercari);
	// console.log(productsMercari.length);

	// ===================================
	// console.log("========== Start crawler page paypay! ==========");
	// const productsPaypay = await Promise.all(paypays.map(paypay => crawlerPaypay(paypay)));
	// const productsPaypay =  paypays.map(async (paypay) => {await crawlerPaypay(paypay)});
	// console.log(productsPaypay);
	// console.log(productsPaypay.length);
	// ===================================
	console.log("========== Start crawler page amazon! ==========");
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
			"--disable-default-browser-check"
		]
		// args: [ '--proxy-server=200.73.128.156:3128' ]
	});
	const proxy = "http://api.scraperapi.com?api_key=c0752f9b2f826bbbac400e4469001d7d&url=";
	const page = await browser.newPage();
	let products = [];
	// const productAmazon = await Promise.all(amazonList.map(amazon => ));
	for (let index = 0; index < amazonList.length; index++) {
		const amazon = amazonList[index];
		let b = await crawlerAmazon(amazon, browser, page);
		products.push(b);
	}

	console.dir(products, {
		depth: null
	});
	console.log(products.length);
	await browser.close();
	return products;
	// ===================================
	// console.log("========== Start crawler page ebay! ==========");
	// let eBays = [
	// 	'https://www.ebay.com/itm/402926975907',
	// 	// 'https://www.ebay.com/itm/283562949261'
	// ];

	// const productEbay = await Promise.all(eBays.map(ebay => crawlerEbay(ebay)));
	// console.log(productEbay.length);
	// console.dir(productEbay, { depth: null });
}

// test();

async function run() {
	const browser = await puppeteer.launch({
		headless: false,
		//   args: [ '--proxy-server=23.254.122.227:8800' ]
	});
	const page = await browser.newPage();
	const proxy = "http://api.scraperapi.com?api_key=c0752f9b2f826bbbac400e4469001d7d&url=";
	const url = 'https://www.amazon.co.jp/-/en/%E3%83%99%E3%82%B9%E3%83%88%E3%82%AB%E3%83%BC%E7%B7%A8%E9%9B%86%E9%83%A8-ebook/dp/B09XDS3BNM/ref=tmm_kin_swatch_0?_encoding=UTF8&qid=&sr=';
	const pageUrl = proxy + url;

	await page.goto(pageUrl);
	// const pageUrl = 'https://whatismyipaddress.com/';

	// await page.goto(pageUrl);
}

//   run();
async function main(params) {
	process.setMaxListeners(0);
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
		],
		browserContext: "default",
	});
	const page = await browser.newPage();

	let product = [];
	let url = params.supplierval || '';

	switch (params.suppliername) {
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
	await res.send("Test server is running success!")
})

app.get('/search', async (req, res) => {

	let search = req.query;
	let response = [];
	let listPages = [
		'ebay.com',
		'amazon.co.jp',
		'paypayfleamarket.yahoo.co.jp',
		'jp.mercari.com'
	];
	let url = search.supplierval || '';
	let inArray = false;
	try {
		inArray = listPages.some(item => url.includes(item));
		if (!inArray) {
			throw new Error('Url invalid');
		}
		
		response = await main(search);
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