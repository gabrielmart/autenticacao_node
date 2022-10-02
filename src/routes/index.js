const express = require('express')
const user = require('./user.routes')
const auth = require('./auth.routes')

const routes = (app) => {
    app.route('/')
        .get((req, res) => {
            res.status(200).json({ msg: 'Bem vindo a nossa API!' })
        })

    app.use(express.json())
    app.use('/auth', auth)
    app.use('/user', user)
}

module.exports = routes 
