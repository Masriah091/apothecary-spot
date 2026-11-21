// Play test for The Witch's Apothecary: drives the real game in headless
// Chromium and asserts the rules — finds on BOTH panels, the misclick
// penalty, hints, the keyboard lens, time-out and retry.
// Run: node test-play.mjs
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/home/hatch/workspace/shots-tool/package.json');
const puppeteer = require('puppeteer');
const gameRoot = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = join(gameRoot, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!path.startsWith(gameRoot) || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:${port}/index.html?shot=start`, {
  waitUntil: 'domcontentloaded', timeout: 120000,
});
await page.waitForFunction(() => typeof window.__apothecary !== 'undefined', { timeout: 120000 });

const results = [];
const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);

check('starts on the start screen', await page.evaluate(() => window.__apothecary.state === 'start'));
await page.click('#ov-start');
check('start leads to the round intro', await page.evaluate(() => window.__apothecary.state === 'intro'));
await page.click('#ov-begin');
check('intro leads to playing', await page.evaluate(() => window.__apothecary.state === 'playing'));

// Find the first difference (the brew's hue) by clicking the LEFT panel,
// and the second (the tall candle) on the RIGHT panel: the hunt must work
// on either picture, at the anchor the 3D scene projected.
const leftBox = await (await page.$('#panel-left')).boundingBox();
const rightBox = await (await page.$('#panel-right')).boundingBox();
const spots = await page.evaluate(() => window.__apothecary.diffs.slice(0, 2).map((d) => ({ x: d.x, y: d.y, id: d.id })));
await page.mouse.click(leftBox.x + spots[0].x, leftBox.y + spots[0].y);
let state = await page.evaluate(() => ({
  found: window.__apothecary.foundAt.size,
  score: window.__apothecary.score,
  left: document.getElementById('left-count').textContent,
  foundLabel: document.getElementById('found-count').textContent,
}));
check(`clicking ${spots[0].id} on the left panel finds it`, state.found === 1 && state.score === 100);
check('counter shows 11 TO FIND', state.left === '11 TO FIND');
check('found readout shows FOUND 1 / 12', state.foundLabel === 'FOUND 1 / 12');
await page.mouse.click(rightBox.x + spots[1].x, rightBox.y + spots[1].y);
state = await page.evaluate(() => ({ found: window.__apothecary.foundAt.size, score: window.__apothecary.score }));
check(`clicking ${spots[1].id} on the right panel finds it`, state.found === 2 && state.score === 200);

// Misclick on an empty stretch of floor: score and time both drop.
const before = await page.evaluate(() => ({ score: window.__apothecary.score, t: window.__apothecary.timeLeft }));
await page.mouse.click(rightBox.x + 300, rightBox.y + 615);
const afterMiss = await page.evaluate(() => ({
  score: window.__apothecary.score, t: window.__apothecary.timeLeft, misses: window.__apothecary.totalMisses,
}));
check('misclick costs 25 points', afterMiss.score === before.score - 25);
check('misclick costs about 5 seconds', before.t - afterMiss.t >= 5 && before.t - afterMiss.t < 6.5);
check('misclick is counted', afterMiss.misses === 1);

// Hint: one is spent, a target is chosen, points are taken.
await page.keyboard.press('h');
const hint = await page.evaluate(() => ({
  hints: window.__apothecary.hintsLeft, target: !!window.__apothecary.hintTarget, score: window.__apothecary.score,
}));
check('hint spends the purse', hint.hints === 2);
check('hint picks a live target', hint.target === true);
check('hint costs 40 points', hint.score === afterMiss.score - 40);

// Keyboard lens: arrows wake it, Enter checks at its position.
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowDown');
const lens = await page.evaluate(() => ({ active: window.__apothecary.lens.active, clicks: window.__apothecary.totalClicks }));
await page.keyboard.press('Enter');
const clicksAfter = await page.evaluate(() => window.__apothecary.totalClicks);
check('lens wakes on arrows', lens.active === true);
check('Enter checks at the lens', clicksAfter === lens.clicks + 1);

// Pause holds the clock.
await page.keyboard.press('p');
const t1 = await page.evaluate(() => window.__apothecary.timeLeft);
await new Promise((r) => setTimeout(r, 600));
const t2 = await page.evaluate(() => window.__apothecary.timeLeft);
check('pause holds the clock', Math.abs(t1 - t2) < 0.01);
await page.click('#ov-resume');

// Run the clock out: game over, then retry returns to the intro.
await page.evaluate(() => { window.__apothecary.timeLeft = 0.15; });
await page.waitForFunction(() => window.__apothecary.state === 'game-over', { timeout: 20000 }).catch(() => {});
check('time out ends the round', await page.evaluate(() => window.__apothecary.state === 'game-over'));
await page.click('#ov-retry');
check('retry returns to the intro', await page.evaluate(() => window.__apothecary.state === 'intro'));
await page.click('#ov-begin');
// Find all twelve through real clicks at their projected anchors.
const all = await page.evaluate(() => window.__apothecary.diffs.map((d) => ({ x: d.x, y: d.y })));
for (const d of all) await page.mouse.click(rightBox.x + d.x, rightBox.y + d.y);
check('finding all 12 clears the round', await page.evaluate(() => window.__apothecary.state === 'round-clear'));

console.log(results.join('\n'));
console.log(errors.length ? `PAGE ERRORS: ${errors.join(' | ')}` : 'no page errors');
await browser.close();
server.close();
if (results.some((r) => r.startsWith('FAIL')) || errors.length) process.exitCode = 1;
