const pino = require('pino')

const log = pino({ name: 'licensezero-server' })

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
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD'
  )
}

requiredEnvironmentVariables.forEach(key => {
  if (!process.env[key]) {
    log.error({ key }, 'missing environment variable')
    process.exit(1)
  }
})

const schemas = require('./schemas')
if (!schemas.validate.publicKey(process.env.PUBLIC_KEY)) {
  log.error({ key: 'PUBLIC_KEY' }, 'invalid public key')
  process.exit(1)
}

if (!schemas.validate.privateKey(process.env.PRIVATE_KEY)) {
  log.error({ key: 'PRIVATE_KEY' }, 'invalid public key')
  process.exit(1)
}

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

// Policy Enforcement
const policyLog = log.child({ subsystem: 'policy' })
require('./policy/enforce')(policyLog, error => {
  if (error) {
    policyLog.error(error)
    shutDown()
  }
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
