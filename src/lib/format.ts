export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export interface Memo {
  request: string
  details: string
  neededBy: string
  replyTo: string
  from: string
}

/** The memo as it is sent: one line per field, empty optional lines left out. */
export function memoText(memo: Memo): string {
  const lines = [
    `Request: ${memo.request}`,
    `Details: ${memo.details}`,
    memo.neededBy.trim() ? `Needed by: ${memo.neededBy}` : '',
    `Reply to: ${memo.replyTo}`,
    `From: ${memo.from}`,
  ]
  return lines.filter(Boolean).join('\n')
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
