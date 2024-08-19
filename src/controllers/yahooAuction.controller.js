import puppeteer from "puppeteer";
import configPuppeteer from "../configs/puppeteer.config.js";
import configProxy from "../configs/proxy.js";
import axios from "axios-proxy-fix";
import iconv from "iconv-lite";
import cheerio from "cheerio";
import SEND from "../core/success.response.js"
import errorResponse from "../core/error.response.js"

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
        const productPrice = getTextNode($('.Price__value')).replace(',' , '') || 0;
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
       
        function isValidJSONString(str) {
            try {
                JSON.parse(str);
                return true;
            } catch (error) {
                return false;
            }
        }

        scriptTags.each((index, element) => {
            const scriptContent = $(element).html();
            const match = scriptContent.match(regex);
            if (match && match[1] && match[1] !== null && isValidJSONString(match[1])) {
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
