module.exports = (request, response) => {
  const orderID = request.parameters.orderID
  response.end(orderID)
}
