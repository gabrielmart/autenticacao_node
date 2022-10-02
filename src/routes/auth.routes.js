const express = require('express')

const AuthController = require('../controllers/Auth.controller')
const { validationSchema } = require('../middlewares')

const router = express.Router()

router
    .post("/login", validationSchema, AuthController.login)
    .post("/refreshToken", validationSchema, AuthController.refreshToken)
    .post("/passwordReset/:userId/:token", validationSchema, AuthController.passwordReset)
    .post("/passwordReset", validationSchema, AuthController.createPasswordReset)
    .get('/confirmationEmail/:confirmationCode', AuthController.confirmationEmail)

module.exports = router