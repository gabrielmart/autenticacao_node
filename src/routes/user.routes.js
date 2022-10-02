const express = require('express')

const UserController = require('../services/User.service')
const { validationSchema, checkAccessToken } = require('../middlewares')

const router = express.Router()

router
    .post('/', validationSchema, UserController.create)
    .get('/:id', checkAccessToken, UserController.readById)

module.exports = router