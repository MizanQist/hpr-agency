// Capture the page's motion states for review. Usage: node tools/shots.mjs [BASE]
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { chromium } = require(`${process.env.HOME}/.local/node/lib/node_modules/playwright`)

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'shots')
const BASE = process.argv[2] || 'http://localhost:4317/hpr-agency/'
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
let fails = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fails++ }

for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(OUT, `${name}-0-loader.png`) })
  await page.waitForTimeout(2800)
  await page.mouse.move(viewport.width * 0.7, viewport.height * 0.5)
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, `${name}-1-hero.png`) })
  const h = await page.evaluate(() => innerHeight)
  for (const [i, frac] of [[2, 0.35], [3, 0.7], [4, 1]]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), h * frac)
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(OUT, `${name}-${i}-exit-${Math.round(frac * 100)}.png`) })
  }
  // section 3: the statement track runs from 200vh to 420vh
  for (const [i, frac] of [[6, 2.15], [7, 2.6], [8, 3.1], [9, 3.7], [10, 4.1]]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), h * frac)
    await page.waitForTimeout(1000)
    if (i === 9) { await page.mouse.move(viewport.width * 0.5, viewport.height * 0.42); await page.waitForTimeout(600) }
    await page.screenshot({ path: path.join(OUT, `${name}-${i}-statement-${Math.round(frac * 100)}.png`) })
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(800)
  await page.click('button[aria-label="Open menu"]')
  await page.waitForTimeout(1400)
  await page.screenshot({ path: path.join(OUT, `${name}-5-menu.png`) })
  const r = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    docH: document.documentElement.scrollHeight,
    lenis: document.documentElement.classList.contains('lenis'),
    cursor: document.documentElement.classList.contains('has-cursor'),
    menuOpen: document.querySelector('#site-menu')?.getAttribute('aria-hidden'),
  }))
  console.log(`\n== ${name}`, JSON.stringify(r))
  check(r.overflow <= 0, `${name}: no horizontal overflow (${r.overflow})`)
  check(errors.length === 0, `${name}: no console errors ${errors.join('; ').slice(0, 300)}`)
  check(r.menuOpen === 'false', `${name}: menu opens`)
  await ctx.close()
}
await browser.close()
console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAIL(S)'} — ${OUT}`)
process.exit(fails ? 1 : 0)
