const http = require('http')
const server = require('./server')
const tape = require('tape')

module.exports = (path) => {
  tape(`POST ${path}`, test => {
    server((port, close) => {
      http.request({ port, path, method: 'POST' }, response => {
        test.equal(response.statusCode, 405, '405')
        test.end()
        close()
      }).end()
    })
  })
}
