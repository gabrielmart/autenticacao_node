const express = require('express')

const UserController = require('../controllers/User.controller')
const { validationSchema, checkAccessToken } = require('../middlewares')

const router = express.Router()

router
    .post('/user', validationSchema, UserController.create)
    .post("/user/login", validationSchema, UserController.login)
    .post("/user/refreshToken", validationSchema, UserController.refreshToken)
    .get('/user/:id', checkAccessToken, UserController.readById)

module.exports = router