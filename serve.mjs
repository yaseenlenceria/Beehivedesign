/* Local preview server — serves the site exactly like production:
   /contact  ->  contact.html   (clean URLs) */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".xml": "text/xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  if (p.endsWith("/")) p += "index.html";
  let file = path.join(root, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const idx = path.join(file, "index.html");
    file = fs.existsSync(idx) ? idx : file + ".html";
  }
  if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
  if (!fs.existsSync(file)) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
}).listen(8080, () => console.log("Beehive Design preview → http://localhost:8080"));
