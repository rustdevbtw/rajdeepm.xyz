import * as fs from "node:fs/promises";
import * as path from "node:path";

const directoryPath = './posts';

let posts = {};
let replaced = [];

async function listFiles() {
  try {
    // Read the contents of the directory
    const files = await fs.readdir(directoryPath, { withFileTypes: true });

    // Loop over the files
    for (const file of files) {
      const fullPath = path.join(directoryPath, file.name);
      if (file.isFile()) {
        const filename = file.name;
        let contents = (await fs.readFile(fullPath)).toString("utf8");
        let [title, content] = contents.split("\n\n");
        title = title.replaceAll("\n", " ");
        const route = `/${file.name.replaceAll(".txt", "")}`;
        posts[route] = title;
        replaced.push(`\t· ${title} (goto ${route})`);
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

await listFiles();

let c = await fs.readFile("./index.txt");
c = c.toString("utf8").replaceAll("#POSTS_AUTO", `Posts:\n${replaced.join("\n")}`);
await fs.writeFile("./index.txt", c);
let s = JSON.stringify(posts, 4);
await fs.writeFile("./meta.json", s);
