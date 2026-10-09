import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, mailtoUrl, memoText, whatsappUrl } from './format.ts'

test('memo is one line per field and drops an empty optional line', () => {
  const text = memoText({ request: 'a watch', details: 'Skeleton, blue strap', neededBy: '', replyTo: '0803', from: 'A.' })
  assert.equal(text, 'Request: a watch\nDetails: Skeleton, blue strap\nReply to: 0803\nFrom: A.')
})

test('memo keeps the optional line when given', () => {
  const text = memoText({ request: 'a jet', details: 'x', neededBy: 'June', replyTo: 'y', from: 'z' })
  assert.match(text, /\nNeeded by: June\n/)
})

test('memo drops any empty line, not just the optional one', () => {
  const text = memoText({ request: '', details: 'A table for eight on Friday', neededBy: '', replyTo: 'me@x.y', from: '  ' })
  assert.equal(text, 'Details: A table for eight on Friday\nReply to: me@x.y')
})

test('links encode newlines and ampersands', () => {
  assert.equal(whatsappUrl('2340000000000', 'a&b\nc'), 'https://wa.me/2340000000000?text=a%26b%0Ac')
  assert.equal(mailtoUrl('x@y.z', 'Request', 'a b'), 'mailto:x@y.z?subject=Request&body=a%20b')
})

test('date reads as a letter heading', () => {
  assert.equal(formatDate(new Date(2026, 9, 9)), '9 October 2026')
})
