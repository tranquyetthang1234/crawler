import cheerio from "cheerio";
import SEND from "../core/success.response.js"
import errorResponse from "../core/error.response.js"
import configPuppeteer from "../configs/puppeteer.config.js";

async function getListCategory(req, res) {
    let listCategoryId = req.query.listCategoryId ?? '';
    console.log(listCategoryId);

    if (listCategoryId !== '') {
        listCategoryId = listCategoryId.split(',');
    } else {
        listCategoryId = [0];
    }

    console.log("list category id: " + listCategoryId + "\n");

    try {
        const listCategory = [];

        for (const categoryId of listCategoryId) {
            let url = 'https://jp.mercari.com/categories';

            if (categoryId !== 0) {
                url += '?category_id=' + categoryId;
            }

            const {page} = await configPuppeteer(url);
            const dataFormResponse = await page.evaluate(() => document.querySelector('*').outerHTML);
            const $ = await cheerio.load(dataFormResponse);

            $('.merList .merListItem').each(function () {
                const aTag = $(this).find('a');
                const name = aTag.text();
                const link = aTag.attr('href');
                const id = link.split('=')[1] ?? null;

                if (link.search('category_id=') !== -1 && (categoryId === 0 || id !== categoryId)) {
                    listCategory.push({
                        id,
                        parentId: categoryId,
                        name,
                        link: 'https://jp.mercari.com' + link
                    });
                }
            });
        }

        new SEND({
            status: 200,
            message: "get success!",
            data: {
                total: listCategory.length,
                listCategory
            },
        }).send(res);
    } catch (error) {
        const data = { isStock: false };

        if (error && error.response && error.response.status === '404') {
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

export default { getListCategory }