export interface Memo {
  request: string
  details: string
  neededBy: string
  replyTo: string
  from: string
}

export const EMPTY_MEMO: Memo = { request: '', details: '', neededBy: '', replyTo: '', from: '' }

export const MEMO_LABELS: Record<keyof Memo, string> = {
  request: 'Request',
  details: 'Details',
  neededBy: 'Needed by',
  replyTo: 'Reply to',
  from: 'From',
}

/** The memo as it is sent: one line per filled field, in order. */
export function memoText(memo: Memo): string {
  return (Object.keys(MEMO_LABELS) as Array<keyof Memo>)
    .filter((k) => memo[k].trim())
    .map((k) => `${MEMO_LABELS[k]}: ${memo[k].trim()}`)
    .join('\n')
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
