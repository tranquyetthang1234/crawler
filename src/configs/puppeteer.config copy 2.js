import puppeteer from "puppeteer";
import configProxy from "../configs/proxy.js"
import errorResponse from "../core/error.response.js"

async function configPuppeteer(url) {
    let ipProxy = configProxy.getIpProxy();
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: false,
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-zygote",
            "--single-process",
            "--disable-site-isolation-trials",
            "--disable-features=site-per-process",
            // `--proxy-server=${ ipProxy }`
        ],
        browserContext: "default",
    });
    console.log(ipProxy)
    const page = await browser.newPage();

    try {
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        await page.setDefaultNavigationTimeout(100000);
        await page.setRequestInterception(true);
        await page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.respond({ status: 200, body: 'aborted' })
            } else {
                request.continue();
            }
        });

        page.waitForNavigation({
            waitUntil: "domcontentloaded",
        });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 40000
        })
        
        await page.waitForTimeout(1000);
        await page.waitForSelector('body');
        await page.$x('/html/body');

        return { browser, page };
    } catch (error) {
        // await browser.close();
        throw new errorResponse.ErrorResponse(error, 500);
        console.log(error)
    }
}

export default configPuppeteer