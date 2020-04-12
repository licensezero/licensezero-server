const uuid = require('uuid')

require('./not-found')(`/orders/${uuid.v4()}`)

require('./get-only')(`/orders/${uuid.v4()}`)
