import { test, expect, chromium } from '@playwright/test';

test('sudo 404', async () => {
  const browser = await chromium.launch();

  // Tạo một trang mới
  const page = await browser.newPage();

  // Điều hướng đến URL cần kiểm tra
  const urlToCheck = 'https://www.sudo-sekizai.co.jp/';
  await page.goto(urlToCheck);

  // Lấy mã trạng thái HTTP
  // const status = page.mainFrame().response().status();

  // Kiểm tra xem mã trạng thái có phải là 200 hay không
  // if (status === 200) {
  //   console.log(`URL ${urlToCheck} trả về mã trạng thái 200.`);
  // } else {
  //   console.error(`URL ${urlToCheck} trả về mã trạng thái ${status}.`);
  // }

  // Đóng trình duyệt
  await browser.close();
});

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwrightzzzz/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
