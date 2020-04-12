const dirname = require('path').dirname
const fs = require('fs')
const http = require('http')
const runSeries = require('run-series')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')

module.exports = (path, pathFunction, title) => {
  tape(`GET ${path}`, test => {
    server((port, close) => {
      writeTerms(_ => {
        http.request({ port, path }, response => {
          test.equal(response.statusCode, 200, '200')
          test.equal(response.headers['content-type'], 'text/html', 'text/html')
          simpleConcat(response, (_, buffer) => {
            const html = buffer.toString()
            test.assert(html.includes(`<title>${title}</title>`), 'serves HTML with <title>')
            test.end()
            close()
          })
        }).end()
      })
    })
  })

  function writeTerms (callback) {
    const file = pathFunction()
    runSeries([
      done => {
        fs.mkdir(dirname(file), { recursive: true }, done)
      },
      done => {
        const html = `
  <!doctype html>
  <html lang=en-US>
    <head>
      <meta charset=UTF-8>
      <title>${title}</title>
    </head>
    <body>
      <h1>${title}</h1>
    </body>
  </html>
        `.trim() + '\n'
        fs.writeFile(file, html, done)
      }
    ], callback)
  }

  require('./not-found')(path)

  require('./get-only')(path)
}
