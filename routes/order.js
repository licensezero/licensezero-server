const Busboy = require('busboy')
const dirname = require('path').dirname
const fs = require('fs')
const internalError = require('./internal-error')
const paths = require('../data/paths')
const read = require('../data/read')
const runParallel = require('run-parallel')
const runSeries = require('run-series')
const schemas = require('../schemas')
const uuid = require('uuid')

module.exports = (request, response) => {
  if (request.method !== 'POST') {
    response.statusCode = 405
    return response.end()
  }

  const fields = Object.keys(schemas.json.order.properties)
  const order = {}
  const parser = new Busboy({
    headers: request.headers,
    limits: {
      fieldNameSize: Math.max(fields.map(field => field.length)),
      fieldSize: 256,
      fields: fields.size + (process.env.MAX_OFFERS || 10),
      files: 0
    }
  })

  parser.on('field', (name, value, truncated, encoding, mime) => {
    if (fields.includes(name)) {
      if (name.endsWith('[]')) {
        if (Array.isArray(order[name]) && !order[name].includes(value)) {
          order[name].push(value)
        } else {
          order[name] = [value]
        }
      } else {
        order[name] = value
      }
    }
  })

  let errored = false

  parser.once('error', error => {
    if (errored) return
    errored = true
    internalError(request, response, error)
  })

  parser.once('finish', () => {
    if (errored) return

    if (!schemas.validate.order(order)) {
      response.statusCode = 400
      response.setHeader('Content-Type', 'text/plain')
      return response.end('Invalid Order')
    }

    const orderID = uuid.v4()
    checkOfferIDs(order, (error, missing) => {
      if (error) {
        return internalError(request, response, error)
      }

      if (missing.length !== 0) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/plain')
        return response.end(`Unknown OfferIDs: ${missing.join(', ')}`)
      }

      writeOrder(request, orderID, order, (error) => {
        if (error) {
          return internalError(request, response, error)
        }

        response.statusCode = 303
        response.setHeader('Location', `/pay?orderID=${orderID}`)
        response.end()
      })
    })
  })

  request.pipe(parser)
}

function checkOfferIDs (offer, callback) {
  const missing = []
  runParallel(
    offer['offerIDs[]'].map(offerID => {
      return done => {
        read.offer(offerID, (error, _) => {
          if (error) {
            if (error.code === 'ENOENT') {
              missing.push(offerID)
            } else {
              callback(error)
            }
          }
          done()
        })
      }
    }),
    error => {
      if (error) return callback(error)
      callback(null, missing)
    }
  )
}

function writeOrder (request, orderID, order, callback) {
  const path = paths.order(orderID)
  const record = {
    date: new Date().toISOString(),
    xForwardedFor: request.headers['x-forwarded-for'],
    remoteAddress: request.connection.remoteAddress,
    userAgent: request.headers['user-agent'],
    requestID: request.id,
    order
  }
  request.log.info(record, 'order')
  runSeries([
    fs.mkdir.bind(null, dirname(path)),
    fs.writeFile.bind(null, path, JSON.stringify(record))
  ], callback)
}
