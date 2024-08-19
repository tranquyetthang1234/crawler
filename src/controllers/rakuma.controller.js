import cheerio from "cheerio";
import puppeteer from "puppeteer";
// import axios from "axios";
import axios from "axios-proxy-fix";

import iconv from "iconv-lite";

import errorResponse from "../core/error.response.js"
import SEND from "../core/success.response.js"

import configPuppeteer from "../configs/puppeteer.config.js"
import configProxy from "../configs/proxy.js"


async function crawlCategory(req, res, next) {

    const categories = [];
    const URL = "https://fril.jp";
    const URL_CATEOGRY = URL + "/category";

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    try {
        let proxyConfig = {
            host: ip,
            port: port,
        };

        const response = await axios({
            url: URL_CATEOGRY,
            proxy: proxyConfig,
            timeout: 1000 * 20, //20s
        });

        const $ = await cheerio.load(response.data);
        // level 1 
        let level1 = [];
        // $('.list-group .list-group-item.small.branch').each((i, element1) => {
        $('.panel.list-group').each((i, element1) => {
            let stt = i + 1;
            let level1Cat = {};
            
            level1Cat.name_group = $(`#menu${stt} > a:nth-child(1)`).text().trim().replace('すべて', '');
            level1Cat.href = $(`#menu${stt} > a:nth-child(1)`).attr('href').replace(/[^\d]/g, "");
            level1.push(level1Cat);

            let level2 = [];
            $(`#menu${stt} .sublinks`).each((j, element1) => {
                let k = j + 1;
                let level2Cat = {};
                $(`#menu_${stt}_${k}.sublinks a`).each((t, element2) => {
                    if (t == 0) {
                        console.log("text: " + $(element2).attr('href'))
                        level2Cat.category_name = $(element2).text().trim().replace('すべて', '');
                        level2Cat.href = URL + $(element2).attr('href');
                        level2Cat.cat_id = $(element2).attr('href').replace(/[^\d]/g, "");
                        level2.push(level2Cat);
                        level1Cat.category = level2;
                    }
                })

                let level3 = [];
                $(`#menu_${stt}_${k}.sublinks a`).each((s, element2) => {
                    let level3Cat = {};
                    if (s > 0) {
                        level3Cat.name = $(element2).text().trim();
                        level3Cat.href = URL + $(element2).attr('href');
                        level3Cat.cat_id = $(element2).attr('href').replace(/[^\d]/g, "");
                        level3.push(level3Cat);
                        level2Cat.sub_categories = level3;
                    }
                })
            })
        })

       
        new SEND({
            status: 200,
            message: "get success!",
            data: level1,
        }).send(res);

    } catch (err) {
        throw new errorResponse.ErrorResponse(err, 500);
    }
}

async function getInfoDetail(req, res) {
    const url = req.query.url;
    const outStock = "この商品は売り切れです";
    // const url = "https://item.rakuten.co.jp/f434281-takamori/078-566/";
    // const url = "https://item.rakuten.co.jp/rickys/tpu_t/?iasid=07rpp_10096___e4-lieb1m2a-89-fd7a7b1f-a7f1-4a1d-b56e-165ede8dcd28";

    let data = {};

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

        let variantSelector = null;
        let isVariantion = false
        let attributesCheckbox = [];
        let attributesSelect = [];

        var dataAPI = "";
        if ($("#item-page-app-data").text() != '') {
            dataAPI = JSON.parse($("#item-page-app-data").html());
        } else if ($('script[type="application/json"]').text() != '') {
            dataAPI = JSON.parse($('script[type="application/json"]').html());
        }

        if (dataAPI) {
            isVariantion = true;

            variantSelector = dataAPI.api.data.itemInfoSku.variantSelectors;

            let customizationOptions = dataAPI.api.data.itemInfoSku.customizationOptions;;
            let asurakuInfo = dataAPI.api.data.itemInfoSku.sku;
            let variantMappedInventories = dataAPI.api.data.itemInfoSku.purchaseInfo.variantMappedInventories;
             data.imss = dataAPI.api.data;
            attributesCheckbox = asurakuInfo.map(item => {
                const variant = variantMappedInventories.find(v => v.sku === item.variantId);
                if (item.selectorValues.length > 0) {
                    var parentName = item.selectorValues[0];
                    var childName = item.selectorValues[1];
                } else {
                    var parentName = item.selectorValues[0];
                    var childName = null;
                }

                const quantity = variant ? variant.quantity : 0;
                const isStock = quantity > 0 ? 1 : 0;
                if (quantity > 0) {
                    return {
                        parentName,
                        childName,
                        variantId: item.variantId,
                        quantity,
                        isStock,
                        typeSelect: 1
                    };
                }
            }).filter(Boolean);

            attributesSelect = customizationOptions.map(customOption => {
                return customOption.selections.map(selection => {
                    return {
                        parentName: customOption.key,
                        childName: selection.value,
                        variantId: "1",
                        quantity: 1,
                        isStock: 1,
                        typeSelect: 2
                    };
                });
            }).flat().filter(Boolean);

        }

        // check sotck 
        let is_stock = true;
        let getStockElement = $('#rakutenLimitedId_aroundCart .text-display--1Iony.type-body--1W5uC.size-medium--JpmnL');
        if (getStockElement != null) {
            let textStock = getStockElement.text().trim();
            if (textStock.includes(outStock)) {
                is_stock = false
            }
        }

        data.variantSelectors = variantSelector;
        data.attributes = [...attributesCheckbox, ...attributesSelect];
        data.isVariantion = isVariantion;
        data.is_stock = is_stock;

        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (error) {
        throw new errorResponse.ErrorResponse(error, 500);
    }
}

async function searchDetail(req, res) {
    const url = req.query.url;
    const outStock = "この商品は売り切れです";
    let data = {};

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
            let argData = dataAPI.api.data
            data.itemId = argData.itemInfoSku.itemId
            data.shopUrl = dataAPI.shop.shopUrl
            data.searchShop = dataAPI.shop.shopUrl + ":" + argData.itemInfoSku.itemId;
            // data.datas = dataAPI;
            // data.itemName = argData.itemInfoSku.title
            // data.itemPrice = dataAPI.rat.genericParameter.ratPrice
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

        data.categoryId = catId;
        data.url = url;
        new SEND({
            status: 200,
            message: "get success!",
            data: data,
        }).send(res);

    } catch (error) {
        throw new errorResponse.ErrorResponse(error, 500);
    }
}


async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

export default { crawlCategory, getInfoDetail, searchDetail }