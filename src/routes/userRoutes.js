const jwt = require('jsonwebtoken')
const express = require('express')

const UserController = require('../controllers/UserController')
const checkToken = require('../middleware/checkToken')

const router = express.Router()

router
    .post('/user', UserController.create)
    .post("/user/login", UserController.login)
    .get('/user/:id', checkToken, UserController.readById)

module.exports = router