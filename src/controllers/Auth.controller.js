const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const RefreshToken = require('../models/RefreshToken.model')

class AuthController {
    static login = async (req, res) => {
        const { email, password } = req.body

        const user = await User.findOne({ email: email })

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!user || !checkPassword) {
            return res.status(404).json({ msg: "Usuário ou Senha incorreto!" })
        }

        if (user.status != 'Active') {
            return res.status(403).json({ msg: "Conta pendente de confirmação. Por favor verifique seu email!" })
        }

        const oldRefreshToken = await RefreshToken.findOne({ user: user.id }).sort({ created: -1 })

        const accessToken = generateAccessToken(user)
        const newRefreshToken = await generateRefreshToken(user)

        if (oldRefreshToken && oldRefreshToken.isActive)
            await revokeRefreshToken(oldRefreshToken, newRefreshToken)

        return res.status(200).json({ msg: "Autenticacão realizada com sucesso", token: accessToken, refreshToken: newRefreshToken.token })
    }

    static refreshToken = async (req, res) => {
        const { refreshToken: reqRefreshToken } = req.body

        const oldRefreshToken = await RefreshToken.findOne({ token: reqRefreshToken }).populate('user')

        if (!oldRefreshToken) return res.status(404).json({ msg: 'Refresh Token inválido!' })

        if (oldRefreshToken.isExpired || !oldRefreshToken.isActive) {
            return res.status(403).json({ msg: 'Refresh Token está inativado ou expirado!' })
        }

        const { user } = oldRefreshToken

        const newRefreshToken = await generateRefreshToken(user)
        const newAccessToken = generateAccessToken(user)

        await revokeRefreshToken(oldRefreshToken, newRefreshToken)

        return res.status(200).json({
            msg: 'Access Token gerado!',
            token: newAccessToken,
            refreshToken: newRefreshToken.token
        })
    }

    static confirmationEmail = async (req, res) => {
        const { confirmationCode } = req.params

        const user = await User.findOne({
            confirmationCode
        })

        if (!user || user.status === "Active") {
            return res.status(400).json({ msg: "Requisição Invalida!" })
        }

        user.status = "Active"
        user.save()

        return res.status(200).json({ msg: "Usuário confirmado!" })
    }
}

const generateAccessToken = (user) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    return jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = async (user) => {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
    const token = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

    const refreshToken = new RefreshToken({
        user: user.id,
        token,
        expires: new Date(jwt.decode(token).exp * 1000)
    })

    await refreshToken.save()

    return refreshToken
}

const revokeRefreshToken = async (oldRefreshToken, newRefreshToken) => {
    oldRefreshToken.revoked = Date.now()
    oldRefreshToken.replacedByToken = newRefreshToken.token
    await oldRefreshToken.save()
}

module.exports = AuthController