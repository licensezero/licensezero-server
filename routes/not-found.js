module.exports = (request, response) => {
  response.statusCode = 404
  response.setHeader('Content-Type', 'text/plain')
  response.end('Not Found')
}
