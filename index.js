const express = require('express')
const { getRevenues, getIndex } = require('./api-get.js')
const app = express()

app.disable('x-powered-by')

// ==============================================
// SERVE REQUESTS FOR /
app.get('/', getIndex)

// ==============================================
// RETURN ILIBRARY ECOMMERCE REVENUES INFORMATION
app.get('/revenues', getRevenues)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Revenues API server started on port ${PORT}`)
});
