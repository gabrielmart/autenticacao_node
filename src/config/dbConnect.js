const mongoose = require('mongoose')

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.z0zh7sr.mongodb.net/?retryWrites=true&w=majority`)

const db = mongoose.connection

module.exports = db