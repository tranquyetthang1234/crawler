import puppeteer from "puppeteer";
import configPuppeteer from "../configs/puppeteer.config.js";
import configProxy from "../configs/proxy.js";
import axios from "axios-proxy-fix";
import iconv from "iconv-lite";
import cheerio from "cheerio";
import SEND from "../core/success.response.js"
import errorResponse from "../core/error.response.js"

// async function getInfoDetail(req, res) { 
//     const browser = await puppeteer.launch();
//     const url = 'https://page.auctions.yahoo.co.jp/jp/auction/r1077935858';
//     const {page} = await configPuppeteer(url);
//     // const page = await browser.newPage();
//     // await page.goto("https://page.auctions.yahoo.co.jp/jp/auction/h1083895371");
//     const product_images = await page.evaluate(() => {
//         let items = document.querySelectorAll(".ProductImage__inner img");
//         let links = [];
//         items.forEach(item => {
//             links.push(item.getAttribute("src"));
//         });
//         return links;
//     });
//     console.log(product_images)
//     const thumb = await page.evaluate(() => {
//         let items = document.querySelectorAll(".ProductImage__thumbnail a img");
//         let links = [];
//         items.forEach(item => {
//             links.push(item.getAttribute("src"));
//         });
//         return links;
//     });
//     console.log(thumb)
//     const product = await page.evaluate(() => {
//         let info = [];
//         let name = document.getElementsByClassName("ProductTitle__text")[0].innerHTML ?? 1;
//         let price = document.getElementsByClassName("Price__value")[0].innerText ?? 2; 
//         info.push({
//             product_title: name,
//             current_price: price
//         });
//         return info;
//     });
//     const detail = await page.evaluate(() => {
//         let items_1 = document.querySelectorAll(".Section__tableHead");
//         let items_2 = document.querySelectorAll(".Section__tableData");
//         let links = [];
//         let links_2 = [];
//         let links_3 = {};
//         items_2.forEach(item2 => {
//             links_2.push(item2.innerText);
//         });

//         items_1.forEach(item => {
//             links.push(item.innerText);
//         });
//         for (let i = 0; i < links.length; i++) {
//             links_3[links[i]] = links_2[i];
//         }
//         return links_3;
//     });
//     const send_from = await page.evaluate(() => {
//         let items = document.querySelectorAll(".Price__postageFrom")[0].innerText;
//         return items;
//     });
//     await page.waitForSelector('#postageDetailCurrent');
//     await page.click('#postageDetailCurrent');
//     await delay(300);
//     // for(let i = 1; i<48; i++){
//     //     let j = i;
//     //     await page.select('.js-localpost-select', ''+j);
//     //     await delay(300);
//     //     const prefecture = await page.evaluate(() => {
//     //         let items = document.querySelectorAll(".BidModal__postagePrice")[0].innerText;
//     //         let item1 = document.querySelectorAll(".js-localpost-title")[0].innerText;
//     //         let links = [];
//     //         links.push({
//     //             prefecture : item1,
//     //             fee_ship : items
//     //         });
//     //         return links;
//     //     });
//     //     console.log(prefecture)
//     // }
//     console.log(product_images);
//     console.log(thumb);
//     console.log(product);
//     console.log(detail);
//     console.log(send_from);
//     // await page.screenshot({ path: `screenshots/github-profile.jpeg`,fullPage: true });
//     await browser.close();
//     function delay(time) {
//         return new Promise(function(resolve) {
//             setTimeout(resolve, time)
//         });
//     }
// }

async function getInfoDetail(req, res) {
    const scrapeUrl = req.query.url;

    console.log("scrapeUrl " + scrapeUrl);

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    let proxyConfig = {
        host: ip,
        port: port,
    };
    try {
        
        const getTextNode = (element) => {
            return element.contents().filter(function() {
                return this.nodeType === 3;
            }).text().trim();
        };

        const getImageFromElements = (elements, attr, attrAlt) => {
            const result = [];
            elements.each(function () {
                const value = $(this).attr(attr);
                const alt = $(this).attr(attrAlt);
                if (value) {
                    result.push({value, alt});
                }
            });

            return result;
        };

        const dataFormResponse = await axios({
            url: scrapeUrl,
            responseType: 'arraybuffer',
            // proxy: proxyConfig,
            timeout: 1000 * 20, //20s
        });
        
        const $ = await cheerio.load(dataFormResponse.data);

        const productName = $('.ProductTitle__text').text();

        const productPrice = getTextNode($('.Price__value'))
                                .replace(',' , '') || 0;

        const elementImage = $('.ProductImage__inner img');
        const listImage = getImageFromElements(elementImage, 'src', 'alt');

        const productDesc = $('#ProductExplanation .ProductExplanation__commentArea').html();
    

        const scriptTags = $('script[type="text/javascript"]');
        const regex = /var\s+pageData\s*=\s*({[^;]+})/;
        let pageData = null;
        let itemId = 1;
        let quantity = null;
        let bids = null;
        let starttime = null;
        let endtime = null;
        let productCategoryID = null;
        
        scriptTags.each((index, element) => {
            const scriptContent = $(element).html();
            const match = scriptContent.match(regex);
            if (match) {
                pageData = JSON.parse(match[1]);
            }
        });

        if (pageData) {
            itemId = pageData.items.productID || '';
            productCategoryID = pageData.items.productCategoryID || '';
            quantity = pageData.items.quantity || '';
            bids = pageData.items.bids || '';
            starttime = pageData.items.starttime || '';
            endtime = pageData.items.endtime || '';
        }

        const productInfo  = {
            itemId,
            productCategoryID,
            quantity,
            bids,
            starttime,
            endtime,
            productName,
            productPrice,
            productDesc,
            listImage,
            isStock: true,
        }
      
        new SEND({
            status: 200,
            message: "get success!",
            data: productInfo,
        }).send(res);

    } catch (error) {
        if (error && error.response && error.response.status == '404') {
            console.log(error.response.status);
            let data = { isStock: false };
            new SEND({
                status: 200,
                message: "get success!",
                data: data,
            }).send(res);
        } else {
            throw new errorResponse.ErrorResponse(error, 500);
        }
    }
}



export default { getInfoDetail }
