const path = require('path')

const subdirectory = (name) => path.join(process.env.DIRECTORY, name)
const file = (name) => path.join(process.env.DIRECTORY, name)

const bundles = () => subdirectory('bundles')
const bundle = id => path.join(bundles(), `${id}.json`)

const offers = () => subdirectory('offers')
const offer = id => path.join(offers(), id, 'offer.json')

const orders = () => subdirectory('orders')
const order = id => path.join(orders(), `${id}.json`)

const receipts = () => subdirectory('receipts')
const receipt = id => path.join(receipts(), `${id}.json`)

const sellers = () => subdirectory('sellers')
const seller = id => path.join(sellers(), id, 'seller.json')

module.exports = {
  broker: id => file('broker.json'),
  brokerageTerms: () => file('brokerage-terms.html'),
  bundles,
  bundle,
  offer,
  offers,
  order,
  orders,
  receipt,
  receipts,
  seller,
  sellers,
  termsOfService: () => file('terms-of-service.html')
}
