const express = require('express')

const AuthController = require('../controllers/Auth.controller')
const { validationSchema } = require('../middlewares')

const router = express.Router()

router
    .post("/auth/login", validationSchema, AuthController.login)
    .post("/auth/refreshToken", validationSchema, AuthController.refreshToken)
    .post("/auth/passwordReset/:userId/:token", validationSchema, AuthController.passwordReset)
    .post("/auth/passwordReset", validationSchema, AuthController.createPasswordReset)
    .get('/auth/confirmationEmail/:confirmationCode', AuthController.confirmationEmail)

module.exports = router