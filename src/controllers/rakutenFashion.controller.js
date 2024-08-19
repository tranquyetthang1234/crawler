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

        const getAttributeImageFromElements = (elements, attr, attrAlt) => {
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

        const getVariationSizes = (colors, tableSelector, textOutStock) => {
            const valueSkuSizes = {};

            colors.forEach(function (color) {
                const table = $(tableSelector).filter(`[data-color="${color}"]`);

                if (!table.length) return;

                const listItemTable = [];

                table.find('tr').each((rowIndex, row) => {
                    const objectSizes = { color };

                    objectSizes.size = $(row).find('td:nth-child(1)').text().trim();
                    objectSizes.sizeText = $(row).find('td:nth-child(2)').text().trim();

                    if (!$(row).find('td:nth-child(2)').text().trim().includes(textOutStock)) { 
                        listItemTable.push(objectSizes);
                    }
                });

                valueSkuSizes[color] = listItemTable;
            });

            return valueSkuSizes;
        };

        const getAttributeFromElements = (elements, attr) => {
            const result = [];
            elements.each(function () {
                const value = $(this).attr(attr);
                if (value) {
                    result.push(value);
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
        
        const elementName = $('.item-name');
        const elementPrice = $('.item-price .item-price-actual .item-price-actual-value');
        const elementDesc = $('.item-detail-description-text');
        const elementImage = $('.item-images-thumbnail-container ul li.item-images-thumbnail-item img');
        const elementSkuColor = $(".item-sku-actions-color-text");

        const productName = elementName.text();
        const productPrice = getTextNode(elementPrice).replace(',' , '') || 0;
        const productDesc = elementDesc.html();
        const listImage = getAttributeImageFromElements(elementImage, 'src', 'alt')
                            .map(imageUrl => (
                                { url: 'https:' + imageUrl.value.split('?')[0], alt: imageUrl.alt }
                            ));
        const labelSkuColor = getTextNode(elementSkuColor).replace('：' , '') || 'カラー';
        const valueSkuColors = getAttributeFromElements($('.item-sku-actions-color-list li'), 'data-color');

        const labelSkuSize = $(".item-sku-actions-info.show .item-sku-actions-info-caption").text().trim() || 'サイズ';
        const textOutStock = '在庫なし';
        const valueSkuSizes = getVariationSizes(valueSkuColors, 'table.item-sku-actions-info', textOutStock);

        // const textOutStock = '在庫なし';
        // const valueSkuSizes = {};
        // var listItemTable = [];
        let isStock = false;

        // valueSkuColors.forEach(function (color) {
        //     const table = $('table.item-sku-actions-info').filter(`[data-color="${color}"]`);
        //     if (!table.length) return;
           
        //     table.find('tr').each((rowIndex, row) => {
        //         const objectSizes = { color };

        //         objectSizes.size = $(row).find('td:nth-child(1)').text().trim();
        //         objectSizes.sizeText = $(row).find('td:nth-child(2)').text().trim();
            
        //         // Extract stock status
        //         const textStock = $(row).find('td:nth-child(2)').text().trim();
            
        //         // Add object to the list if in stock
        //         if (!textStock.includes(textOutStock)) { 
        //             listItemTable.push(objectSizes);
        //         }
        //     })

        //     valueSkuSizes[color] = listItemTable;
        //     listItemTable = [];
        // })

        // check stock 
        for (var i = valueSkuColors.length - 1; i >= 0; i--) {
            if (valueSkuSizes && valueSkuSizes[valueSkuColors[i]] && valueSkuSizes[valueSkuColors[i]].length == 0) {
                delete valueSkuSizes[valueSkuColors[i]];
                valueSkuColors.splice(i, 1);
            } else {
                isStock = true;
            }
        }

        const variationInfo = {
            labelSkuColor,
            valueSkuColors,
            labelSkuSize,
            valueSkuSizes
        }
    
        const productInfo  = {
            productPrice,
            // productPrice: productPrice < 3980 ? 770 : productPrice,
            productName,
            productDesc,
            listImage,
            variationInfo,
            is_stock: isStock,
            scrapeUrl
        }
      
        new SEND({
            status: 200,
            message: "get success!",
            data: productInfo,
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



async function sleep(millisecond) {
    return new Promise(resolve => setTimeout(resolve, millisecond));
}

export default { getInfoDetail }

//https://books.rakuten.co.jp/rb/17305536/?l-id=item-c-pbook-n