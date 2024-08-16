import { Context, Hono } from "@hono/hono";
import posts from "./meta.json" with { type: "json" };

const app = new Hono();

async function sstatic(p: string, headers: object = {}): Promise<Response> {
  return new Response(await Deno.readFile(p), {
    headers: {
      "X-Is-Caveman": "1",
      "X-File": p,
      ...headers,
    },
  });
}

const BASE: string =
  "https://raw.githubusercontent.com/rustdevbtw/rajdeepm.xyz/%S/%F";

async function fstatic(
  sha: string,
  p: string,
  headers: object = {},
): Promise<Response> {
  const r = BASE.replaceAll("%S", sha).replaceAll("/%F", p);
  return new Response(await (await fetch(r)).blob(), {
    headers: {
      "X-Is-Caveman": "1",
      "X-File": r,
      "X-Is-Archive": "1",
      "X-SHA": sha,
      ...headers,
    },
  });
}

app.get("*", async (c: Context) => {
  const sha = c.req.query("sha") || c.req.header("X-Archive-SHA") || false;
  const latest = c.req.query("latest") != undefined ||
    c.req.header("X-Archive-Latest") || false;
  const html = (c.req.query("html") != undefined ||
    c.req.header("Accept")?.includes("text/html") || c.req.header("X-HTML") ||
    false) && c.req.query("txt") == undefined;
  const { url } = c.req;
  const parsed = new URL(url);
  if (!sha && latest) {
    switch (c.req.path) {
      case "/":
        return sstatic(`index.${html ? "html" : "txt"}`, {
          "Content-Type": html ? "text/html" : "text/plain",
        });
      case "/gpg":
        return sstatic("./keys/gpg");
      case "/ssh":
        return sstatic("./keys/ssh");
      case "/favicon.ico":
        return sstatic("./favicon.png", { "Content-Type": "image/png" });
      case "/font.woff2":
        return sstatic("/font.woff2", { "Content-Type": "font/woff2" });
      default:
        try {
          return await sstatic(
            `./posts${c.req.path}.${html ? "html" : "txt"}`,
            { "Content-Type": html ? "text/html" : "text/plain" },
          );
        } catch (err) {
          return new Response(`Woopsie!\nSomething went wrong:\n${err}`);
        }
    }
  } else {
    if (!sha) {
      // @ts-ignore posts has everything. Don't worry
      return c.redirect(
        `${c.req.path}${parsed.search || "?"}&sha=${posts[c.req.path]}`,
      );
    }

    switch (c.req.path) {
      case "/":
        return fstatic(sha, `/index.${html ? "html" : "txt"}`, {
          "Content-Type": html ? "text/html" : "text/plain",
        });
      case "/gpg":
        return fstatic(sha, "/keys/gpg");
      case "/ssh":
        return fstatic(sha, "/keys/ssh");
      case "/favicon.ico":
        return fstatic(sha, "/favicon.png", { "Content-Type": "image/png" });
      case "/font.woff2":
        return fstatic(sha, "/font.woff2", { "Content-Type": "font/woff2" });
      default:
        try {
          return await fstatic(
            sha,
            `/${c.req.path}.${html ? "html" : "txt"}`,
            { "Content-Type": html ? "text/html" : "text/plain" },
          );
        } catch (err) {
          return new Response(`Woopsie!\nSomething went wrong:\n${err}`);
        }
    }
  }
});

Deno.serve(app.fetch);
