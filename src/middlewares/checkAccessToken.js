const { expressjwt: jwt } = require('express-jwt')

const SECRET = process.env.ACCESS_TOKEN_SECRET

const checkAccessToken = jwt({ secret: SECRET, algorithms: ['HS256'] })

module.exports = checkAccessToken