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
    const categoriesParentIgnore = [
        'https://www.rakuten.co.jp/category/auto/',
        'https://www.rakuten.co.jp/category/bedding/',
        'https://www.rakuten.co.jp/category/flower/',
        'https://www.rakuten.co.jp/category/service/',
    ]
    const subcateIgnore = [
        'https://www.rakuten.co.jp/category/110472/',
        'https://www.rakuten.co.jp/category/100236/',
        'https://www.rakuten.co.jp/category/100228/',
        'https://www.rakuten.co.jp/category/200990/',
        'https://www.rakuten.co.jp/category/100246/',
        'https://www.rakuten.co.jp/category/201085/',
        'https://www.rakuten.co.jp/category/100268/',
        'https://www.rakuten.co.jp/category/201018/',
        'https://www.rakuten.co.jp/category/100250/',
        'https://www.rakuten.co.jp/category/200911/',
    ];
    let url = "https://www.rakuten.co.jp/category/?l-id=top_normal_gmenu_d_list";

    let ipProxy = configProxy.getIpProxy();
    let [ip, port] = ipProxy.split(":");

    try {
        let proxyConfig = {
            host: ip,
            port: port,
        };

        const response = await axios({
            url: url,
            proxy: proxyConfig,
        });

        const $ = await cheerio.load(response.data);

        var ii = 0;
        $('.gtc-sectionBase').each((index, element) => {
            $(element).children('.gtc-listTitle').each((i, el) => {
                let nameGroup = $(el).text();
                let group = {};
                group.name_group = nameGroup;

                let subCategories = [];
                $(element).find('div > a > div.gtc-genreUnit__title').each((k, elChildren) => {
                    let info = {};
                    let hrefPrent = $(elChildren).parent().attr('href');
                    if (!categoriesParentIgnore.includes(hrefPrent)) {
                        info.category_name = $(elChildren).text();
                        info.href = hrefPrent;
                        subCategories.push(info);
                        group.category = subCategories;
                    }

                    let arrSubCategories = [];
                    let stt = k + 1;
                    $(element).find('div > div:nth-child(' + stt + ') > div > ul > li > a').each((k, elSub) => {
                        ii++;
                        let hrefChid = $(elSub).attr('href');
                        let subName = $(elSub).text();
                        if (hrefPrent == 'https://www.rakuten.co.jp/category/food/') {
                            if (!subcateIgnore.includes(hrefChid)) {
                                arrSubCategories.push({ 'name': subName, "href": hrefChid, 'cat_id': $(elSub).attr('href').replace(/[^\d]/g, "") });
                            }
                        } else {
                            arrSubCategories.push({ 'name': subName, "href": hrefChid, 'cat_id': $(elSub).attr('href').replace(/[^\d]/g, "") });
                        }

                        info.sub_categories = arrSubCategories;
                    })
                })
                categories.push(group);
            })
        })
        console.log('ii' + ii)

        new SEND({
            status: 200,
            message: "get success!",
            data: categories,
        }).send(res);

    } catch (err) {
        throw new errorResponse.ErrorResponse(err, 500);
    }
}

async function getInfoDetail(req, res) {
    const url = req.query.url;
    const outStock = "この商品は売り切れです";
    // const url = "https://item.rakuten.co.jp/wellsuppli/kamika_rw_pouch123123/";
    // const url = "https://item.rakuten.co.jp/beprice/0201205h0235178/";
    // const url = "https://item.rakuten.co.jp/rickys/tpu_t/?iasid=07rpp_10096___e4-lieb1m2a-89-fd7a7b1f-a7f1-4a1d-b56e-165ede8dcd28";
    // const url = "https://item.rakuten.co.jp/auc-vector/052-902306220047/?s-id=rk_shop_pc_rnkInShop";
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
            // proxy: proxyConfig,
            timeout: 1000 * 20, //20s
        });

        const datas = iconv.decode(Buffer.from(response.data), 'EUC-JP');
        const $ = await cheerio.load(datas);

        let variantSelector = null;
        let isVariantion = false
        let attributesCheckbox = [];
        let attributesSelect = [];
        var itemId = null;
        var shopUrl = null;
        var stockProduct = true;
        var dataAPI = "";
        var catId = '';


        if ($("#item-page-app-data").text() != '') {
            dataAPI = JSON.parse($("#item-page-app-data").html());
        } else if ($('script[type="application/json"]').text() != '') {
            dataAPI = JSON.parse($('script[type="application/json"]').html());
        }

        if (dataAPI) {
            try {
                isVariantion = true;

                variantSelector = dataAPI.api.data.itemInfoSku.variantSelectors;

                let customizationOptions = dataAPI.api.data.itemInfoSku.customizationOptions;
                let asurakuInfo = dataAPI.api.data.itemInfoSku.sku;
                let variantMappedInventories = dataAPI.api.data.itemInfoSku.purchaseInfo.variantMappedInventories;

                attributesCheckbox = asurakuInfo.map(item => {
                    const variant = variantMappedInventories.find(v => v.sku === item.variantId);
                    if (item.selectorValues && item.selectorValues.length > 0) {
                        var parentName = item.selectorValues[0] + "zzzzzzzz'szzzzzzz";
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
                            typeSelect: 1,
                            priceItem: item.taxIncludedPrice ? parseInt(item.taxIncludedPrice) : 0
                        };
                    }
                }).filter(Boolean);

                attributesSelect = customizationOptions.map(customOption => {
                    if (customOption.selections && customOption.selections.length > 0) {
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
                    }
                }).flat().filter(Boolean);

                var { itemId, shopUrl, stockProduct } = await handelStockProduct(dataAPI);

                // get category Id

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

            } catch (error) {
                console.log(error);
            }

        }

        // check sotck 
        // let getStockElement = $('#rakutenLimitedId_aroundCart .text-display--1Iony.type-body--1W5uC.size-medium--JpmnL');
        // if (getStockElement != null) {
        //     let textStock = getStockElement.text().trim();
        //     if (textStock.includes(outStock)) {
        //         is_stock = false
        //     }
        // }

        data.categoryId = catId;
        data.itemId = itemId
        data.shopUrl = shopUrl
        data.searchShop = shopUrl + ":" + itemId;
        data.variantSelectors = variantSelector;
        data.attributes = [...attributesCheckbox, ...attributesSelect];
        data.isVariantion = isVariantion;
        data.is_stock = stockProduct;

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
            // proxy: proxyConfig,
            timeout: 3000 * 20, //20s
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

export default { crawlCategory, getInfoDetail, searchDetail }