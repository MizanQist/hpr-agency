/*
  Every word on the page lives here. Strings that begin with "[CLIENT" are placeholders the client
  has not supplied yet; the Placeholder helper renders them visibly marked. Nothing here is invented —
  no testimonials, statistics, client names or awards.
*/

export const contact = {
  // [CLIENT: WhatsApp number, international format, no plus or spaces]
  whatsapp: '2340000000000',
  // [CLIENT: confirm the enquiries email]
  email: 'hello@hpr.com',
}

export const masthead = {
  brand: 'hpr',
  link: 'Make a request',
}

export const list = {
  headline: 'If it is rare, hard to reach, or not for sale, ask HPR.',
  paragraph:
    'A request desk for private clients. Write what you want. HPR finds it, checks it, prices it and handles everything around it.',
  categories: [
    { id: 'watch', name: 'Watches', option: 'a watch', line: '[CLIENT: one line on what HPR does for watches]' },
    { id: 'jet', name: 'Private jets', option: 'a private jet', line: '[CLIENT: one line on private jets]' },
    { id: 'animal', name: 'Animals', option: 'an animal', line: '[CLIENT: one line, and which animals]' },
    { id: 'property', name: 'Properties', option: 'a property', line: '[CLIENT: one line on properties]' },
    {
      id: 'other',
      name: 'Something else',
      option: 'something else',
      line: 'Cars, art, restaurant tables, tickets, introductions. If it exists, ask.',
    },
  ],
} as const

export const founder = {
  name: '[CLIENT: founder’s full name]',
  title: '[CLIENT: title]',
  bio: '[CLIENT: founder bio, 60–90 words: how he started, what he personally handles]',
  discretion: 'Nothing you ask for leaves this office.',
  conditionsHeading: 'Conditions of business',
  conditions: [
    { term: 'Discretion', line: '[CLIENT: one line]' },
    { term: 'Deposits', line: '[CLIENT: one line]' },
    { term: 'Delivery', line: '[CLIENT: one line]' },
  ],
  pressLabel: 'Mentioned in',
  press: '[CLIENT: press, if any]',
  photoAlt:
    'The founder of HPR, arms crossed, in a blue kaftan and patterned cap, in front of a ribbed concentric plaster wall.',
}

export const object = {
  statement: 'The kind of thing we find.',
  facts: ['100% forged carbon case.', '9H sapphire.', 'Skeleton 02.'],
  note: '[CLIENT: confirm the three facts; make, model, and whether it is an example or available]',
  photoAlt: 'A skeletonised tonneau watch with a grey case and blue textured strap, worn on the wrist.',
}

export const desk = {
  statement: 'The request desk.',
  agency: 'Hoomsuk PR Agency',
  fields: {
    request: { label: 'Request', placeholderOption: 'Choose one' },
    details: { label: 'Details' },
    neededBy: { label: 'Needed by', hint: 'optional' },
    replyTo: { label: 'Reply to', hint: 'phone or email' },
    from: { label: 'From', hint: 'your name' },
  },
  // Required at the boundary: Details and Reply to only; the memo carries the ask without the rest.
  errors: {
    details: 'Write what you want, in a line or two.',
    replyTo: 'Write a phone number or an email we can reply to.',
  },
  send: 'Send the request',
  // Read by screen readers only, after the button and the "open again" link.
  opensWhatsApp: ' (opens WhatsApp)',
  orEmail: 'or send by email',
  stepsHeading: 'What happens next',
  steps: ['Write what you want.', 'We find it, check it and price it.', 'You approve. We handle the rest.'],
  directHeading: 'Or message directly',
  copy: {
    heading: 'Your copy of the request',
    opened: (date: string) => `Opened in WhatsApp, ${date}. Press send there if you have not.`,
    openAgain: 'Open WhatsApp again',
    edit: 'Edit the request',
  },
  emailSubject: 'Request to HPR',
}

export const office = {
  heading: 'Hoomsuk PR Agency',
  columns: [
    { heading: 'Office', lines: ['[CLIENT: office address]', '[CLIENT: city]'] },
    {
      heading: 'Reach',
      lines: ['[CLIENT: WhatsApp number]', '[CLIENT: telephone]', '[CLIENT: enquiries email]', '[CLIENT: Instagram handle]'],
    },
    { heading: 'Registered', lines: ['[CLIENT: registered company name]', '[CLIENT: RC number]'] },
  ],
  legal: '2026 Hoomsuk PR Agency',
  logoAlt: 'HPR, Hoomsuk PR Agency',
}

export const placeholderPrefix = '[CLIENT'
