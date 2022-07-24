
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')

const crawlerMercari = require('./crawler/mercaries.js');
const crawlerPaypay = require('./crawler/paypay.js');
const crawlerAmazon = require('./crawler/amazonjp.js');
const crawlerEbay = require('./crawler/ebay.js');
const app = express();
const PORT = process.env.PORT || 3000;
const IMDB_URL = (movie_id) => `https://www.imdb.com/title/${movie_id}/`;

dotenv.config();
app.use(express.json());

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
	// 'https://paypayfleamarket.yahoo.co.jp/item/z150687138',
	// 'https://paypayfleamarket.yahoo.co.jp/item/z146447822',
	'https://paypayfleamarket.yahoo.co.jp/item/z151746480'
]

let amazonList = [
	'https://www.amazon.co.jp/-/en/TL-SG1005P-Switching-Compatible-Unmanaged-Connector/dp/B09V5S8RR5/ref=lp_2151992051_1_2',
	'https://www.amazon.co.jp/-/en/Mikishin-Artificial-Bouquet-Wedding-Decoration/dp/B07QYFGJGW/ref=lp_10532074051_1_6',
	'https://www.amazon.co.jp/-/en/Keyboard-HUAWEI-MatePad-Tablet-Model/dp/B098DC1BPG/ref=lp_2152014051_1_8',
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

async function init(params) {
	process.setMaxListeners(0);
	let urlSupplier = [];
	let product = [];
	console.log(params.supplierval)
	if (params.supplierval) {
		urlSupplier.push(params.supplierval);
	}
	switch (params.suppliername) {
		
		case 'amazon':
			console.log("========== Start crawler page amazon! ==========");
			product = await Promise.all(urlSupplier.map(url => crawlerAmazon(url)));
			break;
		case 'paypay':
			console.log("========== Start crawler page paypay! ==========");
			product = await Promise.all(urlSupplier.map(url => crawlerPaypay(url)));
			break;
		case 'ebay':
			console.log("========== Start crawler page ebay! ==========");
			product = await Promise.all(urlSupplier.map(url => crawlerEbay(url)));
			break;
		default:
			console.log("========== Start crawler page mercari! ==========");
			product = await Promise.all(urlSupplier.map(url => crawlerMercari(url)));
			break;
	}

	return product;
	// console.log("========== Start crawler page mercari! ==========");
	// const productsMercari = await Promise.all(mercaries.map(mercari => crawlerMercari(mercari)));
	// console.log(productsMercari);
	// console.log(productsMercari.length);

	// ===================================
	// console.log("========== Start crawler page paypay! ==========");
	// const productsPaypay = await Promise.all(paypays.map(paypay => crawlerPaypay(paypay)));
	// // const productsPaypay =  paypays.map(async (paypay) => {await crawlerPaypay(paypay)});
	// console.log(productsPaypay);
	// console.log(productsPaypay.length);
	// ===================================
	// console.log("========== Start crawler page amazon! ==========");
	
	// const productAmazon = await Promise.all(amazonList.map(amazon => crawlerAmazon(amazon)));
	// console.dir(productAmazon, { depth: null });
	// console.log(productAmazon.length);

	// ===================================
	console.log("========== Start crawler page ebay! ==========");
	let eBays = [
		'https://www.ebay.com/itm/402926975907',
		// 'https://www.ebay.com/itm/283562949261'
	];

	const productEbay = await Promise.all(eBays.map(ebay => crawlerEbay(ebay)));

	return productEbay;
	console.log(productEbay.length);
	console.dir(productEbay, { depth: null });
}

app.get('/', async (req, res) => {
    await res.send("Add search term to end of the url /'term'")
})

app.get('/search', async (req, res) => { 
   
	let urls = [
		'https://www.ebay.com',
		'https://www.amazon.co.jp',
		'https://jp.mercari.com',
		'https://paypayfleamarket.yahoo.co.jp'
	];

	let params = {
		itemid: '',
		supplierval: '',
		suppliername: 'amazon',
		templateid: ''
	};

    let search = req.query;
	// if (search && search.itemid && search.supplierval && search.suppliername && search.templateid) {
	// 	params.itemid = search.itemid,
	// 	params.supplierval = search.supplierval,
	// 	params.suppliername = search.suppliername,
	// 	params.templateid = search.templateid
	// } else {
	// 	return res.json({ status: false, data: [], 'message' : 'Params in valid!'});
	// }

	let response = [];
	response = await init(search);
	console.dir(response, { depth: null });
	return await res.json({ status: true, data: response });
})

app.listen(PORT, () => {
	console.log(`Server is running on PORT ${PORT}`);
});
