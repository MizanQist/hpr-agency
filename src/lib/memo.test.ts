import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, mailtoUrl, memoText, whatsappUrl } from './memo.ts'

test('memo is one line per filled field, in order, trimmed', () => {
  const text = memoText({ request: 'a watch', details: ' Skeleton, blue strap ', neededBy: '', replyTo: '0803', from: '' })
  assert.equal(text, 'Request: a watch\nDetails: Skeleton, blue strap\nReply to: 0803')
})

test('links encode newlines and ampersands', () => {
  assert.equal(whatsappUrl('2340000000000', 'a&b\nc'), 'https://wa.me/2340000000000?text=a%26b%0Ac')
  assert.equal(mailtoUrl('x@y.z', 'Request', 'a b'), 'mailto:x@y.z?subject=Request&body=a%20b')
})

test('date reads as a letter heading', () => {
  assert.equal(formatDate(new Date(2026, 9, 10)), '10 October 2026')
})
