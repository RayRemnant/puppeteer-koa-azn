const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

router.get("/api", async (ctx) => {
  const { url, requestUrl } = ctx.request.query;
  console.log("Query parameters:", ctx.request.query);

  const browser = await puppeteer.launch({
    headless: "new",
    // ...more config options
  });

  const page = await browser.newPage();

  //await page.setRequestInterception(true);

  await page.goto(url, {
    timeout: 10000,
  });

  const finalResponse = await page.waitForResponse(
    (response) =>
      response.url() === requestUrl &&
      (response.request().method() === "PATCH" ||
        response.request().method() === "POST"),
    11
  );
  let responseJson = await finalResponse.json();

  console.log(responseJson);

  await browser.close();

  ctx.body = responseJson;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
