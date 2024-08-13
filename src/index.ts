import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";

import puppeteer from "puppeteer";
const browser = await puppeteer.launch();
const takeScreenshotHtml = async (html: string, selector: string) => {
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const element = await page.$(selector);
  const buffer = await element?.screenshot({
    optimizeForSpeed: true,
  });

  return buffer;
};
const takeScreenshotUrl = async (url: string, selector: string) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto(url, { waitUntil: "load" });
  const element = await page.$(selector);
  const buffer = await element?.screenshot({
    optimizeForSpeed: true,
  });

  return buffer;
};

const cloudflareGenerator = (req: Request, server: any) =>
  // get client ip via cloudflare header first
  req.headers.get("CF-Connecting-IP") ??
  // if not found, fallback to default generator
  server?.requestIP(req)?.address ??
  "";

const app = new Elysia()
  //.use(
    //rateLimit({ max: 10, duration: 60 * 1000, generator: cloudflareGenerator })
  //) // 10 requests per minute
  .use(swagger({ excludeStaticFile: false }))
  .get("/", () => "Hello Elysia")
  .post(
    "/img.png",
    async ({ body: { html, selector } }) => {
      const buffer = await takeScreenshotHtml(
        html,
        selector || "body > *:first-child"
      );
      return new Response(buffer, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    },
    {
      body: t.Object({
        html: t.String(),
        selector: t.Optional(t.String()),
      }),
    }
  )
  .get("/today.png", async () => {
    let url = `https://lunch.grahamsh.com/dates/special/${encodeURIComponent(
      new Date().toLocaleString(undefined, {
        day: "2-digit",
        year: "numeric",
        month: "2-digit",
      })
    )}`;
    url = `https://lunch.grahamsh.com/dates/special/08%2F27%2F2024`;

    const buffer = await takeScreenshotUrl(url, "#day-container");
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  });
app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
