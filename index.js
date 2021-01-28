const express = require('express')
const { getRevenues, getIndex } = require('./api-get.js')
const app = express()

// =============================================================================
// IGNORE ALL GET REQUESTS EXCEPT UPTIMEBOT
app.get('/', getIndex)

// =============================================================================
// RETURN STATS, HEATMAP AND MEME DATA AS ONE JSON OBJECT
app.get('/revenues', getRevenues)

app.listen(process.env.PORT || 3000, () => {
  console.log('REPL.IT HTTP Express server started');
});
