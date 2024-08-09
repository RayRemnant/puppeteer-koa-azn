const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

router.get("/api", async (ctx) => {
	try {
		const { url } = ctx.request.query;
		if (!url) {
			ctx.status = 400;
			ctx.body = { error: "Missing url parameter" };
			return;
		}

		//console.log("Query parameters:", ctx.request.query);
		const browser = await puppeteer.launch({
			headless: true, // or false based on your preference
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		const page = await browser.newPage();

		await page.setUserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
		);

		await page.setViewport({ width: 1280, height: 800 });

		await page.goto(url, {
			timeout: 10000,
			waitUntil: "networkidle2", // Wait until the network is idle
		});

		// Get the HTML content of the page
		const html = await page.content();

		await browser.close();

		// Respond with the HTML content
		ctx.body = html;
	} catch (error) {
		console.error("Error occurred:", error);
		ctx.status = 500;
		ctx.body = { error: "Internal Server Error", details: error.message };
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
