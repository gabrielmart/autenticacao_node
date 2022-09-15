const express = require('express')

const UserController = require('../controllers/UserController')
const { validationSchema, checkToken } = require('../middlewares')

const router = express.Router()

router
    .post('/user', validationSchema, UserController.create)
    .post("/user/login", UserController.login)
    .get('/user/:id', checkToken, UserController.readById)

module.exports = router