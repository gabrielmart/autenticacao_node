const userCreateSchema = require('./userCreate.schema')
const loginSchema = require('./login.schema')
const refreshTokenSchema = require('./refreshToken.schema')
const createPasswordResetSchema = require('./createPasswordReset.schema')
const passwordResetSchema = require('./passwordReset.schema')

module.exports = {
    '/user': userCreateSchema,
    '/auth/login': loginSchema,
    '/auth/refreshToken': refreshTokenSchema,
    '/auth/passwordReset': createPasswordResetSchema,
    '/auth/passwordReset/:userId/:token': passwordResetSchema
}