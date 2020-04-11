const pino = require('pino')

const log = pino({ name: 'licensezero.com' })

log.info({ directory: process.env.DIRECTORY }, 'starting')

// Environment Variables

const requiredEnvironmentVariables = [
  'DIRECTORY',
  'NODE_ENV',
  'PORT',
  'PRIVATE_KEY',
  'PUBLIC_KEY',
  'REDIRECT'
]

if (process.env.NODE_ENV !== 'test') {
  requiredEnvironmentVariables.push(
    'MAILGUN_KEY',
    'MAILGUN_DOMAIN',
    'MAILGUN_FROM'
  )
}

requiredEnvironmentVariables.forEach(key => {
  if (!process.env[key]) {
    log.error({ key }, 'missing environment variable')
    process.exit(1)
  }
})

// HTTP Server

const requestHandler = require('./')(log)
const server = require('http').createServer(requestHandler)

// Trap signals.
process
  .on('SIGTERM', logSignalAndShutDown)
  .on('SIGQUIT', logSignalAndShutDown)
  .on('SIGINT', logSignalAndShutDown)
  .on('uncaughtException', exception => {
    log.error(exception)
    shutDown()
  })

server.listen(process.env.PORT, function () {
  const port = this.address().port
  log.info({ port }, 'listening')
})

// Background Jobs

const schedule = require('node-schedule')
const jobs = require('./jobs')

const running = []
jobs.forEach(job => {
  job(log, () => { /* pass */ })
  const scheduled = schedule.scheduleJob('0 * * * *', () => {
    job(log, () => { /* pass */ })
  })
  running.push(scheduled)
})

// Shutdown

function logSignalAndShutDown () {
  log.info('signal')
  shutDown()
}

function shutDown () {
  server.close(() => {
    log.info('closed')
    running.forEach(job => {
      job.cancel()
    })
    process.exit()
  })
}
