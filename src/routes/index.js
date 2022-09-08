const express = require('express')
const user = require('./userRoutes')

const routes = (app) => {
    app.route('/')
        .get((req, res) => {
            return res.status(200).json({ msg: 'Bem vindo a nossa API!' })
        })

    app.use(
        express.json(),
        user
    )
}

module.exports = routes 
