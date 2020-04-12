const uuid = require('uuid')

require('./not-found')(`/bundles/${uuid.v4()}`)

require('./get-only')(`/bundles/${uuid.v4()}`)
