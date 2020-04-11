module.exports = (request, response, error) => {
  request.log.error(error)
  response.statusCode = 500
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify({ error: error.toString() }))
}
