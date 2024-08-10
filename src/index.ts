import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";

import puppeteer from "puppeteer";
const browser = await puppeteer.launch();
const takeScreenshot = async (html: string, selector: string) => {
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const element = await page.$(selector);
  const buffer = await element?.screenshot({
    optimizeForSpeed: true,
  });

  return buffer;
};

const app = new Elysia()
  .use(swagger({excludeStaticFile:false}))
  .get("/", () => "Hello Elysia")
  .post(
    "/img.png",
    async ({ body: { html, selector } }) => {
      const buffer = await takeScreenshot(
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
  );
app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
