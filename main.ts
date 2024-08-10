import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import posts from "./meta.json" with { type: "json" };

const app = new Hono();

async function sstatic(p: string, headers: unknown = {}): Response {
  return new Response(await Deno.readTextFile(p), {
    headers: {
      "X-Is-Caveman": 1,
      "X-File": p,
      ...headers
    }
  });
}

const BASE: string = "https://raw.githubusercontent.com/rustdevbtw/rajdeepm.xyz/%S/%F";

async function fstatic(sha: string, p: string, headers: unknown = {}): Response {
  const r = BASE.replaceAll("%S", sha).replaceAll("/%F", p);
  return new Response(await (await fetch(r)).text(), {
    headers: {
      "X-Is-Caveman": 1,
      "X-File": r,
      "X-Is-Archive": 1,
      "X-SHA": sha,
      ...headers
    }
  })
}

app.get("*", async c => {
  const sha = c.req.query("sha") || c.req.header("X-Archive-SHA") || false;
  const latest = c.req.query("latest") != undefined || c.req.header("X-Archive-Latest") || false;
  if (!sha && latest) {
    switch (c.req.path) {
      case '/':
        return sstatic("index.txt");
      case '/gpg':
        return sstatic("./keys/gpg");
      case '/ssh':
        return sstatic("./keys/ssh");
      case '/favicon.ico':
        return sstatic("./favicon.png", { "Content-Type": "image/png"});
      default:
        try {
          return await sstatic(`./posts${c.req.path}.txt`);
        } catch (err) {
          return new Response(`Woopsie!\nSomething went wrong:\n${err}`);
        }
    }
  } else {
    if (!sha) return c.redirect(`${c.req.path}?sha=${posts["SHA"]}`);

    switch (c.req.path) {
      case '/':
        return fstatic(sha, "/index.txt");
      case '/gpg':
        return fstatic(sha, "/keys/gpg");
      case '/ssh':
        return fstatic(sha, "/keys/ssh");
      case '/favicon.ico':
        return fstatic(sha, "/favicon.png", { "Content-Type": "image/png", "X-Is-ICO": 0 });
      default:
        try {
          return await fstatic(sha, `/posts${c.req.path}.txt`);
        } catch (err) {
          return new Response(`Woopsie!\nSomething went wrong:\n${err}`);
        }
    }
  }
})

Deno.serve(app.fetch);
