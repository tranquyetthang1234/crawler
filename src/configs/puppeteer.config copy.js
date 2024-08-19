import puppeteer from "puppeteer";
import configProxy from "../configs/proxy.js"
import errorResponse from "../core/error.response.js"

async function configPuppeteer(url) {

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
            // `--proxy-server=${ ipProxy }`
        ],
        browserContext: "default",
    });

    let ipProxy = configProxy.getIpProxy();
    const page = await browser.newPage();

    try {
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 40000
        })

        await page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });
       
        await page.waitForTimeout(1000);
        await page.setDefaultNavigationTimeout(100000);
        await page.waitForSelector('body');
        await page.$x('/html/body');
        
        return { browser, page };
    } catch (error) {
        console.log({browser})
        // await browser.close();
        console.error('An error occurred:', error);
        throw new errorResponse.ErrorResponse(error, 500);
    } finally {
        // if (page && !page.isClosed()) {
        //     await page.close();
        // }
        // if (browser.isConnected()) {
        //     await browser.close();
        // }
    }
}

export default configPuppeteer