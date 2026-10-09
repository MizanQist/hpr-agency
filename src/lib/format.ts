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

/** The memo as it is sent: one line per field, empty lines left out. */
export function memoText(memo: Memo): string {
  const lines: Array<[string, string]> = [
    ['Request', memo.request],
    ['Details', memo.details],
    ['Needed by', memo.neededBy],
    ['Reply to', memo.replyTo],
    ['From', memo.from],
  ]
  return lines
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n')
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
