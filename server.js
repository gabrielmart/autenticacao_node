require('dotenv').config()
const app  = require('./src/app')
const dbConnect = require('./src/config/dbConnect')

const PORT = process.env.PORT || 3000

dbConnect()

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})