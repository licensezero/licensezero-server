const fs = require('fs')
const paths = require('../data/paths')
const path = require('path')
const runSeries = require('run-series')

module.exports = callback => {
  const file = paths.termsOfService()
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      const html = `
<!doctype html>
<html lang=en-US>
  <head>
    <meta charset=UTF-8>
    <title>Terms of Service</title>
  </head>
  <body>
    <h1>Terms of Service</h1>
  </body>
</html>
      `.trim() + '\n'
      fs.writeFile(file, html, done)
    }
  ], callback)
}
