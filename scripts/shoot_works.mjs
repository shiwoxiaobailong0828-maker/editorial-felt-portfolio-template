import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('file:///e:/antigravity%20gc/package.json');
const puppeteer = require('puppeteer-core');

const root = 'C:/Users/bailong/.gemini/antigravity/brain/5035f9e4-c5af-41b1-aef7-b9bce09984c1/scratch/personal-site';
const out = 'C:/Users/bailong/.gemini/antigravity/brain/5035f9e4-c5af-41b1-aef7-b9bce09984c1/scratch/mockups/shots';
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };

const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(5201, '127.0.0.1');

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=d3d11'],
});

const slugs = ['shuibao', 'xinglv', 'tansuo', 'nongqing', 'tiheng', 'xingye', 'qiuzhao', 'konbini'];
for (const slug of slugs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  try {
    await page.goto(`http://127.0.0.1:5201/works/${slug}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, slug === 'konbini' ? 12000 : 2500));
    await page.screenshot({ path: `${out}/${slug}.jpg`, type: 'jpeg', quality: 86 });
    const sz = fs.statSync(`${out}/${slug}.jpg`).size;
    console.log(slug, 'OK', Math.round(sz / 1024) + 'KB');
  } catch (e) {
    console.log(slug, '失败:', e.message);
  }
  await page.close();
}
await browser.close();
server.close();
