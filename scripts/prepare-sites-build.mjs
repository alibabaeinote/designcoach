#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

const routeMetadata = {
  "about.html": {
    title: "About — Ali Babaei",
    description: "Ali Babaei is a design mentor and UX consultant helping product teams improve usability, research practice and design process.",
    url: "https://alibabaei.info/about.html",
  },
  "services.html": {
    title: "Engagements — Ali Babaei",
    description: "Consulting and coaching for product teams: usability, research practice, conversion, retention and design-team growth.",
    url: "https://alibabaei.info/services.html",
  },
};

const indexHtml = readFileSync(index, "utf8");
for (const [route, metadata] of Object.entries(routeMetadata)) {
  const routeHtml = indexHtml
    .replaceAll("Ali Babaei — Design decisions your team can ship", metadata.title)
    .replaceAll("Design coaching and UX consulting for product teams in Tehran and remotely worldwide.", metadata.description)
    .replace('<link rel="canonical" href="https://alibabaei.info/" />', `<link rel="canonical" href="${metadata.url}" />`)
    .replace('<meta property="og:url" content="https://alibabaei.info/" />', `<meta property="og:url" content="${metadata.url}" />`);
  writeFileSync(path.join(dist, "client", route), routeHtml);
}

console.log("Prepared Sites build: route entrypoints, dist/server/index.js, and dist/.openai/hosting.json");
