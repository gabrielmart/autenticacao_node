require('dotenv').config()
const express = require('express')
const db = require('./config/dbConnect')
const routes = require('./routes/index')
const { errorResponder } = require('./middlewares/')

db.on("erro", console.log.bind(console, 'Erro de conexão'))
db.once("open", () => {
    console.log('conexão com banco feita com sucesso!')
})

const app = express()
routes(app)
app.use(errorResponder)

module.exports = app