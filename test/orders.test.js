const deleteExpiredOrders = require('../jobs/delete-expired-orders')
const dirname = require('path').dirname
const fs = require('fs')
const paths = require('../data/paths')
const pino = require('pino')
const runSeries = require('run-series')
const server = require('./server')
const tape = require('tape')
const uuid = require('uuid')

require('./not-found')(`/orders/${uuid.v4()}`)

require('./get-only')(`/orders/${uuid.v4()}`)

tape('delete expired order', test => {
  server((port, close) => {
    const id = uuid.v4()
    const date = new Date()
    // Backdate a week ago.
    date.setDate(date.getDate() - 7)
    const record = { created: date.toISOString() }
    const file = paths.order(id)
    runSeries([
      fs.mkdir.bind(null, dirname(file), { recursive: true }),
      fs.writeFile.bind(null, file, JSON.stringify(record))
    ], error => {
      test.ifError(error, 'no write error')
      const log = pino(pino.destination('test-job.log'))
      deleteExpiredOrders(log, () => {
        fs.readFile(file, (error, _) => {
          test.assert(error, 'error')
          test.equal(error.code, 'ENOENT', 'deleted')
          test.end()
          close()
        })
      })
    })
  })
})
