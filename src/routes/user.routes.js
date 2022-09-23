const express = require('express')

const UserController = require('../controllers/User.controller')
const { validationSchema, checkToken } = require('../middlewares')

const router = express.Router()

router
    .post('/user', validationSchema, UserController.create)
    .post("/user/login", validationSchema, UserController.login)
    .post("/user/refreshToken", validationSchema, UserController.refreshToken)
    .get('/user/:id', checkToken, UserController.readById)

module.exports = router