if (process.env.NODE_ENV === 'test') {
  const EventEmitter = require('events').EventEmitter
  const emitter = new EventEmitter()
  module.exports = (options, callback) => {
    setTimeout(() => {
      emitter.emit('sent', options)
      callback()
    }, 500)
  }
  module.exports.events = emitter
} else {
  const nodemailer = require('nodemailer')
  const transport = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT)
      : 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })
  module.exports = transport.sendMail.bind(transport)
}
