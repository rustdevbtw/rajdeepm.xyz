import { Glob } from "bun";

const glob = new Glob("**/*.txt");
const STYLE = Bun.file("style.css");

function gotos(l: string) {
  let r = /([·]\s(?<title>.*)\s[(][g][o][t][o] [\/](?<url>\S*)[)])/;
  return l.split("\n").map((a) => {
    let x = a.match(r);
    if (x) {
      const { title, url } = x.groups as unknown as {
        title: string;
        url: string;
      };
      return `	· <a href="/${url}" >${title}</a>`;
    } else {
      return a;
    }
  }).join("\n");
}

function extractReferences(text: string): (string | undefined)[] {
  const references: (string | undefined)[] = [];
  // Regex to match any URL scheme, including http, https, ftp, mailto, etc.
  const referenceRegex = /\[(\d+)\]:\s*([^\s]+)/g;

  text.replace(referenceRegex, (match: string, index: string, url: string) => {
    references[parseInt(index, 10)] = url;
    return match;
  });

  return references;
}

function replaceReferenceLinks(
  text: string,
  references: (string | undefined)[],
): string {
  const referenceLineRegex = /^\[\d+\]:\s*[^\s]+/;

  return text.split("\n").map((line) => {
    if (referenceLineRegex.test(line)) {
      // Skip replacing in reference lines
      return line;
    } else {
      // Replace [0], [1], etc., with HTML links
      return line.replace(/\[(\d+)\]/g, (match: string, index: string) => {
        const refIndex = parseInt(index, 10);
        const url = references[refIndex];

        if (url) {
          return `<sup><a href="${url}">[${refIndex}]</a></sup>`;
        }

        return match; // No replacement if reference isn't found
      });
    }
  }).join("\n");
}

for await (const file of glob.scan(".")) {
  console.log(file); // => "index.ts"
  const f = Bun.file(file);
  let c = await f.text();
  let [title, ...rest] = c.split("\n\n");
  rest = rest.join("\n\n").replaceAll(">\n\n", ">").replaceAll("<", "&lt;")
    .replaceAll(
      ">",
      "&gt;",
    );
  const refs = extractReferences(rest);
  rest = replaceReferenceLinks(rest, refs);
  rest = gotos(rest);
  rest = rest.split("\n\n").map((x: string) => {
    if (x.startsWith("# ")) {
      return `<h2>${x}</h2>`.replaceAll("\n", "");
    } else {
      return `${x}\n`;
    }
  }).join("");
  rest = rest.replaceAll("\n", "<br/>").replace(
    /```([\s\S]*?)```/g,
    "<code><pre>$1</pre></code>",
  ).replace(/`([^`]*)`/g, "<code>$1</code>").replace(
    "<code><pre><br/>",
    "<code><pre>",
  ).replace("</pre></code><br/>", "</pre></code>");

  const r = `<!DOCTYPE html>
  <html>
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <style>${await STYLE.text()}</style>
      </head>
      <body>
          <h1>${title}</h1>
          <p>${rest}</p>
      </body>
  </html>`;
  await Bun.write(file.replace(".txt", ".html"), r);
}
