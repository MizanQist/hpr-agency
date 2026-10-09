import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FocusEvent, FormEvent, ReactNode } from 'react'
import { contact, desk, list, office } from '../../content/site'
import { t } from '../ui/Placeholder'
import { formatDate, mailtoUrl, memoText, whatsappUrl } from '../../lib/format'
import type { Memo } from '../../lib/format'
import { onDeskRequest } from '../../lib/desk'

type Field = keyof Memo
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
type Errors = Partial<Record<Field, string>>

const REQUIRED = Object.keys(desk.errors) as Exclude<Field, 'neededBy'>[]
const EMPTY: Memo = { request: '', details: '', neededBy: '', replyTo: '', from: '' }
const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`
/* If WhatsApp never takes the screen (blocked pop-up, desktop protocol handler) the copy shows after this beat. */
const NO_HANDOFF_MS = 1500

const SHEET = 'bg-paper p-7 text-navy [--ring:var(--color-navy)] lg:p-14'
/* A bare underline, 1px at rest; focus and error add a second pixel beneath it without moving the line. */
const CONTROL =
  'w-full rounded-none border-b border-navy bg-transparent py-2.5 text-body font-semibold text-navy focus-visible:shadow-[0_1px_0_0_var(--color-navy)] aria-invalid:shadow-[0_1px_0_0_var(--color-navy)]'
const LINK = 'inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 hover:decoration-2'

function errorFor(key: Field, value: string): string | undefined {
  if (key === 'neededBy' || value.trim()) return undefined
  return desk.errors[key]
}

function validate(memo: Memo): Errors {
  const errors: Errors = {}
  for (const key of REQUIRED) errors[key] = errorFor(key, memo[key])
  return errors
}

function Letterhead() {
  const today = new Date()
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div
          aria-hidden="true"
          className="aspect-[501/360] h-[72px] bg-navy"
          style={{
            maskImage: `url(${MASK})`,
            WebkitMaskImage: `url(${MASK})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
        <p className="mt-2 text-caption">{desk.agency}</p>
      </div>
      <time dateTime={today.toISOString().slice(0, 10)} className="text-caption">
        {formatDate(today)}
      </time>
    </div>
  )
}

type LineProps = { field: Field; label: string; hint?: string; error?: string; children: ReactNode }

function MemoLine({ field, label, hint, error, children }: LineProps) {
  return (
    <div className="lg:grid lg:grid-cols-[14ch_1fr] lg:gap-x-6">
      <label htmlFor={`desk-${field}`} className="block text-body font-medium lg:pt-2.5">
        {label}
        {hint && <span className="block text-caption font-normal">{hint}</span>}
      </label>
      <div>
        {children}
        <p id={`desk-${field}-error`} aria-live="polite" className={error ? 'mt-2 text-caption' : 'sr-only'}>
          {error}
        </p>
      </div>
    </div>
  )
}

export function RequestDesk() {
  const [memo, setMemo] = useState<Memo>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [view, setView] = useState<'memo' | 'copy'>('memo')
  const [settled, setSettled] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const returning = useRef(false)
  const dirty = useRef(new Set<Field>())

  useEffect(
    () =>
      onDeskRequest((id) => {
        const category = list.categories.find((c) => c.id === id)
        if (category) setMemo((m) => ({ ...m, request: category.option }))
      }),
    [],
  )

  /* The one motion on the page: the copy settles into place when the visitor comes back from WhatsApp. */
  useEffect(() => {
    if (view !== 'copy' || settled) return
    let left = false
    const settle = () => setSettled(true)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') left = true
      else if (left) settle()
    }
    const onBlur = () => void (left = true)
    const onFocus = () => left && settle()
    const timer = window.setTimeout(() => !left && settle(), NO_HANDOFF_MS)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [view, settled])

  /* "Edit the memo" removes the link that had focus; hand focus to the first line instead. */
  useEffect(() => {
    if (view === 'memo' && returning.current) {
      returning.current = false
      formRef.current?.querySelector<HTMLElement>('select')?.focus()
    }
  }, [view])

  const update = (e: ChangeEvent<Control>) => {
    const key = e.target.name as Field
    const value = e.target.value
    dirty.current.add(key)
    setMemo((m) => ({ ...m, [key]: value }))
    if (errors[key] && value.trim()) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  /* As :user-invalid does: an error shows only once a line has been edited and left, or on submit. */
  const touch = (e: FocusEvent<Control>) => {
    const key = e.target.name as Field
    if (!dirty.current.has(key)) return
    const message = errorFor(key, e.target.value)
    if (message !== errors[key]) setErrors((prev) => ({ ...prev, [key]: message }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(memo)
    const first = REQUIRED.find((key) => found[key])
    if (first) {
      setErrors(found)
      const control = e.currentTarget.elements.namedItem(first)
      if (control instanceof HTMLElement) control.focus()
      return
    }
    window.open(whatsappUrl(contact.whatsapp, memoText(memo)), '_blank', 'noopener')
    setSettled(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setView('copy')
  }

  const handleEdit = () => {
    returning.current = true
    setSettled(false)
    setView('memo')
  }

  const control = (key: Field) => ({
    id: `desk-${key}`,
    name: key,
    value: memo[key],
    onChange: update,
    onBlur: touch,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': `desk-${key}-error`,
    className: CONTROL,
  })

  const waUrl = whatsappUrl(contact.whatsapp, memoText(memo))
  const copyLines = (['request', 'details', 'neededBy', 'replyTo', 'from'] as Field[])
    .filter((k) => k !== 'neededBy' || memo.neededBy.trim())
    .map((k) => [k, desk.fields[k].label, memo[k]] as const)

  return (
    <section
      id="desk"
      aria-labelledby="desk-heading"
      className="scroll-mt-14 bg-navy px-spine py-section text-studio [--ring:var(--color-gold)]"
    >
      <h2 id="desk-heading" className="text-h2 font-normal">
        {desk.statement}
      </h2>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-6">
        {view === 'memo' ? (
          <form ref={formRef} noValidate onSubmit={handleSubmit} className="lg:col-start-1 lg:col-end-9">
            <div className={SHEET}>
              <Letterhead />
              <div className="mt-12 space-y-8">
                <MemoLine field="request" label={desk.fields.request.label} error={errors.request}>
                  <div className="relative after:pointer-events-none after:absolute after:top-1/2 after:right-0 after:-translate-y-1/2 after:content-['▾']">
                    <select
                      {...control('request')}
                      required
                      className={`${CONTROL} appearance-none pr-6 ${memo.request ? '' : 'font-normal!'}`}
                    >
                      <option value="">{desk.fields.request.placeholderOption}</option>
                      {list.categories.map((c) => (
                        <option key={c.id} value={c.option}>
                          {c.option}
                        </option>
                      ))}
                    </select>
                  </div>
                </MemoLine>
                <MemoLine field="details" label={desk.fields.details.label} error={errors.details}>
                  <textarea
                    {...control('details')}
                    required
                    rows={2}
                    className={`${CONTROL} resize-none`}
                    style={{ fieldSizing: 'content' } as CSSProperties}
                  />
                </MemoLine>
                <MemoLine field="neededBy" label={desk.fields.neededBy.label} hint={desk.fields.neededBy.hint}>
                  <input {...control('neededBy')} type="text" autoComplete="off" />
                </MemoLine>
                <MemoLine
                  field="replyTo"
                  label={desk.fields.replyTo.label}
                  hint={desk.fields.replyTo.hint}
                  error={errors.replyTo}
                >
                  <input
                    {...control('replyTo')}
                    type="text"
                    required
                    autoComplete="on"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </MemoLine>
                <MemoLine field="from" label={desk.fields.from.label} hint={desk.fields.from.hint} error={errors.from}>
                  <input {...control('from')} type="text" required autoComplete="name" autoCapitalize="words" />
                </MemoLine>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row-reverse lg:items-center lg:justify-start lg:gap-6">
              <button
                type="submit"
                className="min-h-11 bg-gold px-6 py-2 text-body font-medium text-navy active:opacity-85"
              >
                {desk.send}
              </button>
              <a
                href={mailtoUrl(contact.email, desk.emailSubject, memoText(memo))}
                className={`${LINK} self-start text-caption text-studio lg:self-auto`}
              >
                {desk.orEmail}
              </a>
            </div>
          </form>
        ) : (
          <div
            className={`${SHEET} transition-[translate,opacity] duration-300 ease-out-quart lg:col-start-1 lg:col-end-9 ${
              settled ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
            }`}
          >
            <Letterhead />
            <h3 className="mt-12 text-h4">{desk.copy.heading}</h3>
            <p className="mt-2 text-caption">{desk.copy.opened(formatDate(new Date()))}</p>
            <div className="mt-8 space-y-2 text-body">
              {copyLines.map(([k, label, value]) => (
                <p key={k} className="whitespace-pre-line">
                  {label}: {value}
                </p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
              <a href={waUrl} target="_blank" rel="noopener" className={`${LINK} text-body`}>
                {desk.copy.openAgain}
              </a>
              <button type="button" onClick={handleEdit} className={`${LINK} text-body`}>
                {desk.copy.edit}
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 lg:col-start-10 lg:col-end-13 lg:mt-0">
          <h3 className="text-h4">{desk.stepsHeading}</h3>
          <ol className="mt-6 list-decimal space-y-2 pl-6 text-body">
            {desk.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-12 text-caption">{desk.directHeading}</p>
          <p className="mt-2">
            <a href={`https://wa.me/${contact.whatsapp}`} className={`${LINK} text-caption`}>
              {t(office.columns[1].lines[0])}
            </a>
          </p>
          <p className="mt-2">
            <a href={`mailto:${contact.email}`} className={`${LINK} text-caption`}>
              {t(office.columns[1].lines[2])}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
