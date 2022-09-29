const express = require('express')
const user = require('./user.routes')
const auth = require('./auth.routes')

const routes = (app) => {
    app.route('/')
        .get((req, res) => {
            res.status(200).json({ msg: 'Bem vindo a nossa API!' })
        })

    app.use(
        express.json(),
        auth,
        user
    )
}

module.exports = routes 
