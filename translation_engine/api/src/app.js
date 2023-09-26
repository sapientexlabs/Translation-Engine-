const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors');
const app = express()
const port = 80

app.use(cors());
app.use(bodyparser.json());
app.use(require('./routes'))

const server = app.listen(port, () => {
    console.log(`untertitle api listening at http://localhost:${port}`)
})