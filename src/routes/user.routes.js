const express = require('express')

const UserController = require('../controllers/User.controller')
const { validationSchema, checkAccessToken } = require('../middlewares')

const router = express.Router()

router
    .post('/', validationSchema, UserController.create)
    .get('/:id', checkAccessToken, UserController.readById)

module.exports = router