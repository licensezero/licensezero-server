const artifact = require('./artifact')
const broker = require('./broker')
const bundle = require('./bundle')
const currency = require('./currency')
const digest = require('./digest')
const id = require('./id')
const jurisdiction = require('./jurisdiction')
const ledger = require('./ledger')
const name = require('./name')
const offer = require('./offer')
const order = require('./order')
const price = require('./price')
const privateKey = require('./private-key')
const publicKey = require('./public-key')
const receipt = require('./receipt')
const register = require('./register')
const seller = require('./seller')
const signature = require('./signature')
const time = require('./time')
const url = require('./url')

const AJV = require('ajv')
const ajv = new AJV()
ajv.addSchema(artifact, artifact.$id)
ajv.addSchema(broker, broker.$id)
ajv.addSchema(bundle, bundle.$id)
ajv.addSchema(currency, currency.$id)
ajv.addSchema(digest, digest.$id)
ajv.addSchema(id, id.$id)
ajv.addSchema(jurisdiction, jurisdiction.$id)
ajv.addSchema(ledger, ledger.$id)
ajv.addSchema(name, name.$id)
ajv.addSchema(offer, offer.$id)
ajv.addSchema(order, order.$id)
ajv.addSchema(price, price.$id)
ajv.addSchema(privateKey, privateKey.$id)
ajv.addSchema(publicKey, publicKey.$id)
ajv.addSchema(receipt, receipt.$id)
ajv.addSchema(register, register.$id)
ajv.addSchema(seller, seller.$id)
ajv.addSchema(signature, signature.$id)
ajv.addSchema(time, time.$id)
ajv.addSchema(url, url.$id)

module.exports = {
  json: {
    artifact,
    broker,
    bundle,
    currency,
    digest,
    id,
    jurisdiction,
    ledger,
    name,
    offer,
    order,
    price,
    privateKey,
    publicKey,
    receipt,
    register,
    seller,
    signature,
    time,
    url
  },
  validate: {
    artifact: data => ajv.validate(artifact.$id, data),
    broker: data => ajv.validate(broker.$id, data),
    bundle: data => ajv.validate(bundle.$id, data),
    currency: data => ajv.validate(currency.$id, data),
    digest: data => ajv.validate(digest.$id, data),
    id: data => ajv.validate(id.$id, data),
    jurisdiction: data => ajv.validate(jurisdiction.$id, data),
    ledger: data => ajv.validate(ledger.$id, data),
    name: data => ajv.validate(name.$id, data),
    offer: data => ajv.validate(offer.$id, data),
    order: data => ajv.validate(order.$id, data),
    price: data => ajv.validate(price.$id, data),
    privateKey: data => ajv.validate(privateKey.$id, data),
    publicKey: data => ajv.validate(publicKey.$id, data),
    receipt: data => ajv.validate(receipt.$id, data),
    register: data => ajv.validate(register.$id, data),
    seller: data => ajv.validate(seller.$id, data),
    signature: data => ajv.validate(signature.$id, data),
    time: data => ajv.validate(time.$id, data),
    url: data => ajv.validate(url.$id, data)
  }
}
