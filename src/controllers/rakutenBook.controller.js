import cheerio from "cheerio";
import puppeteer from "puppeteer";
// import axios from "axios";
import axios from "axios-proxy-fix";

import iconv from "iconv-lite";

import errorResponse from "../core/error.response.js"
import SEND from "../core/success.response.js"

import configPuppeteer from "../configs/puppeteer.config.js"
import configProxy from "../configs/proxy.js"


async function getInfoDetail(req, res) {
    const url = req.query.url;
    let data = {};

    console.log("url " + url);

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    let proxyConfig = {
        host: ip,
        port: port,
    };
    try {
        // const dataFormResponse = await axios({
        //     url: url,
        //     responseType: 'arraybuffer',
        //     // proxy: proxyConfig,
        //     timeout: 1000 * 20, //20s
        // });
        
        const { page } = await configPuppeteer(url);
        const dataFormResponse = await page.evaluate(() => document.querySelector('*').outerHTML);
        const $ = await cheerio.load(dataFormResponse);

        // const datas = iconv.decode(Buffer.from(response.data), 'EUC-JP');
        // const $ = await cheerio.load(datas);

        const isbn = $('meta[property="books:isbn"]').attr('content');
        const categoryValue = $('#ratProductCd').val();

        const productId = isbn || categoryValue || '';
        
        data.productId = productId;
        console.log(productId);
        console.log(1111);

        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (error) {
        if (error && error.response && error.response.status == '404') {
            console.log(error.response.status);
            let data = { is_stock: false };
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

async function searchDetail(req, res) {
    const url = req.query.url;
    const outStock = "この商品は売り切れです";
    let data = {};
    var itemId = null;
    var shopUrl = null;
    var stockProduct = true;

    console.log("url " + url)
    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    let proxyConfig = {
        host: ip,
        port: port,
    };
    try {
        const response = await axios({
            url: url,
            responseType: 'arraybuffer',
            proxy: proxyConfig,
            timeout: 1000 * 20, //20s
        });
        const datas = iconv.decode(Buffer.from(response.data), 'EUC-JP');
        const $ = await cheerio.load(datas);
        
        var dataAPI = "";
        if ($("#item-page-app-data").text() != '') {
            dataAPI = JSON.parse($("#item-page-app-data").html());
        } else if ($('script[type="application/json"]').text() != '') {
            dataAPI = JSON.parse($('script[type="application/json"]').html());
        }
        if (dataAPI) {
            var { itemId, shopUrl, stockProduct } = await handelStockProduct(dataAPI);
            data.itemId = itemId
            data.shopUrl = shopUrl
            data.searchShop = shopUrl + ":" + itemId;
        }

        // get category Id
        var catId = '';
        if ($('script[type="application/ld+json"]').text() != '') {
            const categories = JSON.parse($('script[type="application/ld+json"]').html());

            if (categories && categories.itemListElement.length > 0) {

                const itemWithPosition3 = categories.itemListElement.find(item => item.position === 3);

                const id = itemWithPosition3.item && itemWithPosition3.item['@id'];

                if (id) {
                    const urlCategory = itemWithPosition3.item['@id'];
                    catId = urlCategory.match(/\d+/)[0];
                }

            }
        }

        // let is_stock = true;
        // let getStockElement = $('#rakutenLimitedId_aroundCart .text-display--1Iony.type-body--1W5uC.size-medium--JpmnL');
        // if (getStockElement != null) {
        //     let textStock = getStockElement.text().trim();
        //     if (textStock.includes(outStock)) {
        //         is_stock = false
        //     }
        // }

        data.categoryId = catId;
        data.is_stock = stockProduct;
        data.url = url;
        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (error) {
        if (error && error.response && error.response.status == '404') {
            console.log(error.response.status);
            let data = { is_stock: false };
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

async function handelStockProduct(response) {
    let itemId = '';
    let shopUrl = '';
    let stockProduct = true;

    if (response && response.api && response.api.data) {
        let argData = response.api.data;
        if (argData.itemInfoSku) {
            itemId = argData.itemInfoSku.itemId ? argData.itemInfoSku.itemId : '';
            shopUrl = response.shop.shopUrl ? response.shop.shopUrl : '';

            if (argData.itemInfoSku.purchaseInfo && argData.itemInfoSku.purchaseInfo.newPurchaseSku) {
                if (argData.itemInfoSku.purchaseInfo.newPurchaseSku.stockCondition &&
                    argData.itemInfoSku.purchaseInfo.newPurchaseSku.stockCondition == 'sold-out') {
                    stockProduct = false;
                }
            }
        }
    }

    return { itemId, shopUrl, stockProduct };
}


async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

export default {getInfoDetail, searchDetail }

//https://books.rakuten.co.jp/rb/17305536/?l-id=item-c-pbook-n