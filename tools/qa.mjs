// Playwright QA for the HPR site. Usage: node tools/qa.mjs [BASE]  (default http://localhost:4317/hpr-agency/)
// Writes full-page screenshots to tools/shots/, runs axe-core (WCAG 2.1 AA), and exercises the request desk.
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require(`${process.env.HOME}/.local/node/lib/node_modules/playwright`)
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'shots')
const BASE = process.argv[2] || 'http://localhost:4317/hpr-agency/'
const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
let fails = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fails++ }

const VIEWPORTS = [
  ['phone-390', { width: 390, height: 844 }],
  ['phone-320', { width: 320, height: 640 }],
  ['tablet-768', { width: 768, height: 1024 }],
  ['desktop-1440', { width: 1440, height: 900 }],
]

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [name, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 })
  const page = await ctx.newPage()
  const errors = [], failed = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  // scroll through so lazy images load, then back to top
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)) }
    scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, `${name}-full.png`), fullPage: true })
  for (const id of ['list', 'founder', 'object', 'desk-section', 'office']) {
    const el = page.locator(`#${id}`)
    if (await el.count()) await el.screenshot({ path: path.join(OUT, `${name}-${id}.png`) }).catch(() => {})
  }

  const r = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    h1: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName} ${h.textContent.trim().slice(0, 40)}`),
    noAlt: [...document.querySelectorAll('img')].filter((i) => !i.alt).length,
    small: [...document.querySelectorAll('a, button, input, select, textarea')]
      .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.height < 44 || b.width < 44) })
      .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute('aria-label') || e.name || '').trim().slice(0, 24)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`),
    placeholders: document.querySelectorAll('.placeholder').length,
    sticky: getComputedStyle(document.querySelector('header + *, main > :first-child') || document.body).position,
  }))
  console.log(`\n== ${name}`)
  console.log('   headings:', r.headings.join(' | '))
  check(r.overflow <= 0, `${name}: no horizontal overflow (${r.overflow})`)
  check(errors.length === 0, `${name}: no console errors ${errors.join('; ').slice(0, 300)}`)
  check(failed.length === 0, `${name}: no failed requests ${failed.join('; ').slice(0, 300)}`)
  check(r.h1 === 1, `${name}: exactly one h1 (${r.h1})`)
  check(r.noAlt === 0, `${name}: every image has alt text`)
  check(r.small.length === 0, `${name}: every control ≥44px ${r.small.join(', ').slice(0, 400)}`)
  console.log(`   placeholders on page: ${r.placeholders}`)

  // axe-core WCAG 2.1 AA
  await page.addScriptTag({ url: AXE })
  const axe = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
    return res.violations.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target?.[0]}`)
  })
  check(axe.length === 0, `${name}: axe WCAG 2.1 AA clean${axe.length ? '\n      ' + axe.join('\n      ') : ''}`)

  // keyboard: tab through and confirm focus is visible (outline) on interactive elements
  const tabs = []
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}:${cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? 'ring' : 'NO-RING'}` })
    if (info) tabs.push(info)
  }
  check(!tabs.some((t) => t.endsWith('NO-RING')), `${name}: focus ring on every tabbed control (${tabs.length} stops)${tabs.some((t) => t.endsWith('NO-RING')) ? ' ' + tabs.filter((t) => t.endsWith('NO-RING')).join(',') : ''}`)

  // the request desk: empty submit shows errors and opens nothing; a filled memo opens wa.me and swaps to the copy
  const desk = page.locator('#desk-section form')
  if (await desk.count()) {
    await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return {} } })
    await page.locator('#desk-section form button[type=submit]').first().click()
    const afterEmpty = await page.evaluate(() => ({ opened: window.__opened.length, invalid: document.querySelectorAll('#desk-section [aria-invalid="true"], #desk-section :invalid').length }))
    check(afterEmpty.opened === 0 && afterEmpty.invalid > 0, `${name}: empty submit blocked (${afterEmpty.invalid} invalid, ${afterEmpty.opened} opened)`)
    const select = page.locator('#desk-section select').first()
    await select.selectOption({ index: 1 })
    const textareas = page.locator('#desk-section textarea')
    if (await textareas.count()) await textareas.first().fill('Skeleton, blue strap, under 60 days.')
    const texts = page.locator('#desk-section input[type=text], #desk-section input[type=tel], #desk-section input[type=email], #desk-section input:not([type])')
    const n = await texts.count()
    for (let i = 0; i < n; i++) await texts.nth(i).fill(i === n - 1 ? 'A. Client' : '08030000000')
    await page.locator('#desk-section form button[type=submit]').first().click()
    const after = await page.evaluate(() => ({ opened: window.__opened, copy: /Your copy/.test(document.querySelector('#desk-section')?.textContent || '') }))
    check(after.opened.length === 1 && /^https:\/\/wa\.me\/\d+\?text=Request/.test(after.opened[0] || ''), `${name}: send opens wa.me with the memo (${(after.opened[0] || '').slice(0, 70)})`)
    check(after.copy, `${name}: sheet swapped to the visitor's copy`)
    await page.locator('#desk-section').screenshot({ path: path.join(OUT, `${name}-desk-copy.png`) }).catch(() => {})
  } else {
    check(false, `${name}: request desk form present`)
  }
  await ctx.close()
}

await browser.close()
console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAIL(S)'}  — screenshots in ${OUT}`)
process.exit(fails ? 1 : 0)
