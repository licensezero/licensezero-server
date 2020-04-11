const http = require('http')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')

const path = '/robots.txt'

const disallow = 'Disallow: /'
const allUserAgents = 'User-Agent: *'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 200, '200')
      simpleConcat(response, (_, buffer) => {
        const body = buffer.toString()
        test.assert(body.includes(disallow), disallow)
        test.assert(body.includes(allUserAgents), allUserAgents)
        test.end()
        close()
      })
    }).end()
  })
})
