require('express-async-errors')
const express = require('express')
const routes = require('./routes/index')
const { errorResponder, initializeUnhandledException } = require('./middlewares/')

const app = express()
routes(app)
app.use(errorResponder)

initializeUnhandledException()

module.exports = app