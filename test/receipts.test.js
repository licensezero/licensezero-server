const uuid = require('uuid')

require('./not-found')(`/receipts/${uuid.v4()}`)

require('./get-only')(`/receipts/${uuid.v4()}`)
