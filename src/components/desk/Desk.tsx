import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'
import { EMPTY_MEMO, MEMO_LABELS, formatDate, mailtoUrl, memoText, whatsappUrl } from '../../lib/memo'
import type { Memo } from '../../lib/memo'
import { Pattern } from '../shell/Pattern'
import { Magnetic } from '../shell/Magnetic'

const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`

/* Contact details the desk sends to. Placeholders until the client supplies them. */
const WHATSAPP = '2340000000000' // [Client: WhatsApp number, international format]
const EMAIL = 'hello@hpr.com' // [Client: confirm the enquiries email]

const CATEGORIES = [
  { id: 'watch', label: 'Watches', option: 'a watch', word: 'Watches' },
  { id: 'jet', label: 'Private jets', option: 'a private jet', word: 'Jets' },
  { id: 'animal', label: 'Animals', option: 'an animal', word: 'Animals' },
  { id: 'property', label: 'Properties', option: 'a property', word: 'Property' },
  { id: 'other', label: 'Something else', option: 'something else', word: 'Anything' },
]

type Field = keyof Memo
type Errors = Partial<Record<Field, string>>
const ERRORS: Partial<Record<Field, string>> = {
  details: 'Write what you want, in a line or two.',
  replyTo: 'Write a phone number or an email we can reply to.',
}

const FIELD = 'glass w-full rounded-2xl px-4 py-3 text-base text-paper placeholder:text-paper/40 outline-none focus-visible:outline-2 focus-visible:outline-gold'

/*
  Section 6 — the request desk. The giant word behind the room follows the category you hover or choose.
  Glass fields on the left; on the right, the memo writes itself on headed paper as you type, tilting toward the
  pointer. Send opens WhatsApp with the memo as the message and a gold seal stamps the sheet.
*/
export function Desk() {
  const root = useRef<HTMLElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const seal = useRef<HTMLDivElement>(null)
  const [memo, setMemo] = useState<Memo>(EMPTY_MEMO)
  const [errors, setErrors] = useState<Errors>({})
  const [word, setWord] = useState('Request')
  const [sent, setSent] = useState<string | null>(null)
  const touched = useRef(new Set<Field>())
  const still = prefersReducedMotion()

  /* entrance: the word slides in, the two columns rise */
  useEffect(() => {
    const el = root.current
    if (!el || still) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-desk-word]', { xPercent: -20, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } })
      gsap.fromTo('[data-desk-col]', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play none none reverse' } })
      gsap.fromTo('[data-desk-field]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 55%', toggleActions: 'play none none reverse' } })
    }, el)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [still])

  /* the sheet leans toward the pointer */
  useEffect(() => {
    const el = sheet.current
    if (!el || still || !hasFinePointer()) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, { rotateY: px * 8, rotateX: -py * 8, duration: 0.6, ease: 'power3.out', transformPerspective: 1200 })
    }
    const onLeave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [still])

  /* the big word swaps with a wipe */
  const swapWord = (next: string) => {
    if (next === word) return
    const el = root.current?.querySelector<HTMLElement>('[data-desk-word]')
    if (!el || still) {
      setWord(next)
      return
    }
    gsap.timeline()
      .to(el, { clipPath: 'inset(0 0 0 100%)', duration: 0.25, ease: 'power3.in', onComplete: () => setWord(next) })
      .fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'expo.out' })
  }

  const update = (key: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setMemo((m) => ({ ...m, [key]: value }))
    if (errors[key] && value.trim()) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const blur = (key: Field) => () => {
    touched.current.add(key)
    if (ERRORS[key] && !memo[key].trim()) setErrors((prev) => ({ ...prev, [key]: ERRORS[key] }))
  }

  const stamp = () => {
    if (!seal.current || still) return
    gsap.fromTo(seal.current, { scale: 2.2, rotate: -18, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found: Errors = {}
    for (const key of Object.keys(ERRORS) as Field[]) if (!memo[key].trim()) found[key] = ERRORS[key]
    const first = (Object.keys(found) as Field[])[0]
    if (first) {
      flushSync(() => setErrors(found))
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    const url = whatsappUrl(WHATSAPP, memoText(memo))
    if (!window.open(url, '_blank', 'noopener')) {
      window.location.assign(url)
      return
    }
    flushSync(() => setSent(formatDate(new Date())))
    stamp()
  }

  const text = memoText(memo)
  const lines = (Object.keys(MEMO_LABELS) as Field[]).map((k) => ({ key: k, label: MEMO_LABELS[k], value: memo[k].trim() }))

  return (
    <section ref={root} id="desk" data-ground="dark" aria-labelledby="desk-heading" className="relative overflow-hidden bg-navy py-28 text-paper lg:min-h-screen lg:py-32">
      <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.14} dotOpacity={0.3} />
      {/* the room's word: whatever you are asking for, in outline, behind everything */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden">
        <p data-desk-word className="whitespace-nowrap px-spine font-sans text-[22vw] font-extrabold uppercase leading-none tracking-[-0.04em] text-transparent [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1.5px_rgba(209,173,101,0.28)] [font-stretch:85%]">
          {word}
        </p>
      </div>

      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-spine lg:grid-cols-12 lg:gap-x-10">
        {/* the form */}
        <div data-desk-col className="lg:col-span-6">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">06 — The request desk</p>
          <h2 id="desk-heading" className="max-w-[12ch] font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">
            Write what you want.
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-paper/75 sm:text-lg">
            The memo writes itself as you type. Send it and it opens in WhatsApp, word for word.
          </p>

          <form onSubmit={submit} noValidate className="mt-10 space-y-6">
            <fieldset data-desk-field>
              <legend className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-paper/60">Request</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = memo.request === c.option
                  return (
                    <label
                      key={c.id}
                      onMouseEnter={() => swapWord(c.word)}
                      onMouseLeave={() => swapWord(memo.request ? (CATEGORIES.find((x) => x.option === memo.request)?.word ?? 'Request') : 'Request')}
                      className={`glass cursor-pointer rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-[background-color,color] duration-500 ease-[var(--ease-brand)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${on ? '!bg-gold !text-navy' : 'hover:!bg-paper/15'}`}
                    >
                      <input
                        type="radio"
                        name="request"
                        value={c.option}
                        checked={on}
                        onChange={() => {
                          setMemo((m) => ({ ...m, request: c.option }))
                          swapWord(c.word)
                        }}
                        className="sr-only"
                      />
                      {c.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div data-desk-field>
              <label htmlFor="desk-details" className="mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase text-paper/60">
                Details
              </label>
              <textarea
                id="desk-details"
                name="details"
                rows={3}
                value={memo.details}
                onChange={update('details')}
                onBlur={blur('details')}
                aria-invalid={Boolean(errors.details)}
                aria-describedby="desk-details-error"
                placeholder="The reference, the year, the colour. What you have been told so far."
                className={`${FIELD} resize-none [field-sizing:content] min-h-[5.5rem]`}
              />
              <p id="desk-details-error" className={errors.details ? 'mt-2 text-[13px] text-gold' : 'sr-only'}>
                {errors.details}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div data-desk-field>
                <label htmlFor="desk-needed" className="mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase text-paper/60">
                  Needed by <span className="normal-case tracking-normal text-paper/40">optional</span>
                </label>
                <input id="desk-needed" name="neededBy" type="text" value={memo.neededBy} onChange={update('neededBy')} placeholder="A date, or ‘whenever it exists’" className={FIELD} />
              </div>
              <div data-desk-field>
                <label htmlFor="desk-from" className="mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase text-paper/60">
                  From <span className="normal-case tracking-normal text-paper/40">optional</span>
                </label>
                <input id="desk-from" name="from" type="text" autoComplete="name" value={memo.from} onChange={update('from')} placeholder="Your name" className={FIELD} />
              </div>
            </div>

            <div data-desk-field>
              <label htmlFor="desk-reply" className="mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase text-paper/60">
                Reply to
              </label>
              <input
                id="desk-reply"
                name="replyTo"
                type="text"
                autoComplete="tel"
                inputMode="text"
                value={memo.replyTo}
                onChange={update('replyTo')}
                onBlur={blur('replyTo')}
                aria-invalid={Boolean(errors.replyTo)}
                aria-describedby="desk-reply-error"
                placeholder="Phone or email"
                className={FIELD}
              />
              <p id="desk-reply-error" className={errors.replyTo ? 'mt-2 text-[13px] text-gold' : 'sr-only'}>
                {errors.replyTo}
              </p>
            </div>

            <div data-desk-field className="flex flex-wrap items-center gap-5 pt-2">
              <Magnetic>
                <button type="submit" className="inline-flex h-12 items-center rounded-full bg-gold px-6 text-sm font-semibold tracking-wide text-navy transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-paper">
                  Send the request
                  <span className="sr-only"> (opens WhatsApp)</span>
                </button>
              </Magnetic>
              <a href={mailtoUrl(EMAIL, 'Request to HPR', text)} className="text-sm font-medium text-paper/70 underline decoration-1 underline-offset-4 transition-colors hover:text-gold">
                or send by email
              </a>
            </div>
          </form>
        </div>

        {/* the memo */}
        <div data-desk-col className="lg:col-span-5 lg:col-start-8 [perspective:1200px]">
          <div ref={sheet} className="relative rounded-md bg-paper p-7 text-navy shadow-[0_40px_90px_rgba(0,0,0,0.5)] will-change-transform [transform-style:preserve-3d] sm:p-9">
            <div className="flex items-start justify-between">
              <div>
                <div
                  aria-hidden="true"
                  className="h-14 bg-navy"
                  style={{ aspectRatio: '501 / 360', maskImage: `url(${MASK})`, WebkitMaskImage: `url(${MASK})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
                />
                <p className="mt-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-navy/70">Hoomsuk PR Agency</p>
              </div>
              <time dateTime={new Date().toISOString().slice(0, 10)} className="text-[12px] font-medium text-navy/70">
                {formatDate(new Date())}
              </time>
            </div>

            <ol className="mt-8 space-y-4" aria-label="Your memo as it will be sent">
              {lines.map((l) => (
                <li key={l.key} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 border-b border-navy/15 pb-3">
                  <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-navy/60">{l.label}</span>
                  <span className={`min-h-[1.5rem] break-words text-[15px] font-semibold leading-snug ${l.value ? 'text-navy' : 'text-navy/25'}`}>
                    {l.value || '—'}
                  </span>
                </li>
              ))}
            </ol>

            {/* the seal: stamped on when the memo has gone to WhatsApp */}
            <div ref={seal} aria-hidden={!sent} className={`pointer-events-none absolute -bottom-6 -right-4 h-28 w-28 ${sent ? '' : 'opacity-0'}`}>
              <div className="absolute inset-0 rounded-full border-[3px] border-gold" />
              <div className="absolute inset-[7px] rounded-full border border-gold/70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gold">
                <div
                  aria-hidden="true"
                  className="h-8 w-11 bg-gold"
                  style={{ maskImage: `url(${MASK})`, WebkitMaskImage: `url(${MASK})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
                />
                <span className="mt-1 text-[9px] font-bold tracking-[0.2em] uppercase">Sent</span>
              </div>
            </div>

            {sent && (
              <p role="status" className="mt-6 text-[13px] leading-relaxed text-navy/75">
                Opened in WhatsApp, {sent}. Press send there if you have not.{' '}
                <a href={whatsappUrl(WHATSAPP, text)} target="_blank" rel="noopener" className="font-semibold text-navy underline underline-offset-4">
                  Open again
                </a>
              </p>
            )}
          </div>

          <p className="mt-6 text-[12px] leading-relaxed text-paper/55">
            Or message directly:{' '}
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-gold">
              WhatsApp
            </a>{' '}
            · <a href={`mailto:${EMAIL}`} className="underline underline-offset-4 hover:text-gold">{EMAIL}</a>
            <span className="ml-2 opacity-70">[Client: confirm the WhatsApp number and email]</span>
          </p>
        </div>
      </div>
    </section>
  )
}
