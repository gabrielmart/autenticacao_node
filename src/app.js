const express = require('express')
const routes = require('./routes/index')
const { errorResponder } = require('./middlewares/')

const app = express()
routes(app)
app.use(errorResponder)

module.exports = app