const express = require('express')
const user = require('./user.routes')
const auth = require('./auth.routes')
const NotFoundError = require('../errors/NotFound.error')

const routes = (app) => {
    app.route('/')
        .get((req, res) => {
            res.status(200).json({ msg: 'Bem vindo a nossa API!' })
        })

    app.use(express.json())
    app.use('/auth', auth)
    app.use('/user', user)
    app.use((req, res) => { throw new NotFoundError(req.path) })
}

module.exports = routes 
