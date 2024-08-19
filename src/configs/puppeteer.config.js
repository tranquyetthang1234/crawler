import puppeteer from "puppeteer";
import configProxy from "../configs/proxy.js"

async function configPuppeteer(url) {
    try {
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 40000
        })
        await page.waitForTimeout(2000);
        await page.setDefaultNavigationTimeout(100000);
        await page.waitForSelector('body');
        await page.$x('/html/body');

        return { browser, page };
    } catch (error) {
        console.log(error)
    }
}

export default configPuppeteer