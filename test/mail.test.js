const tape = require('tape')
const mail = require('../mail')

tape('mail', test => {
  const to = 'test@example.com'
  const subject = 'Test Subject'
  const text = 'Test messages text.'
  const html = `<p>${text}</p>`
  mail.events.once('sent', options => {
    test.equal(options.to, to, 'to')
    test.equal(options.subject, subject, 'subject')
    test.equal(options.text, text, 'text')
    test.equal(options.html, html, 'html')
    test.end()
  })
  mail({ to, subject, text, html }, error => {
    test.ifError(error)
  })
})
