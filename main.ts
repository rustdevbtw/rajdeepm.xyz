import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const app = new Hono();

async function sstatic(p: string): string {
  return new Response(await Deno.readTextFile(p), {
    headers: {
      "X-Is-Caveman": 1,
      "X-File": p
    }
  });
}

app.get("*", async c => {
  switch (c.req.path) {
    case '/':
      return sstatic("index.txt");
    case '/gpg':
      return sstatic("./keys/gpg");
    case '/ssh':
      return sstatic("./keys/ssh");
    case '/favicon.ico':
      return new Response(await Deno.readFile("./favicon.png"), { headers: { "Content-Type": "image/png", "X-Is-Caveman": 1, "X-File": "favicon.png", "X-Is-ICO": 0 } })
    default:
      try {
        return await sstatic(`./posts${c.req.path}.txt`);
      } catch (err) {
        return new Response(`Woopsie!\nSomething went wrong:\n${err}`);
      }
  }
})

Deno.serve(app.fetch);
