require('dotenv').config()
const app  = require('./src/app')
const db = require('./src/config/dbConnect')

db.on("erro", console.log.bind(console, 'Erro de conexão'))
db.once("open", () => {
    console.log('conexão com banco feita com sucesso!')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`App executando na porta ${PORT}`)
})