const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { checkSingle } = require('@reacherhq/api')
const User = require('../models/User.model')
const RefreshToken = require('../models/RefreshToken.model')

class UserController {
    static create = async (req, res) => {
        const { name, email, password } = req.body

        const isNotValid = await isNotEmailValid(email)

        if (isNotValid) {
            return res.status(422).json({ msg: "Email Inválido!" })
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
            return res.status(422).json({ msg: "Por favor utilize outro email, pois já existe um usuário utilizando!" })
        }

        // create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({
            name,
            email,
            password: passwordHash
        })

        try {
            await user.save()
            return res.status(201).json({ msg: 'Usuário criado com sucesso!' })
        } catch (error) {
            return res.status(500).json({ msg: 'Houve um erro no servidor, tente novamente mais tarde!' })
        }
    }

    static readById = async (req, res) => {
        const id = req.params.id

        const user = await User.findById(id, '-password')

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' })
        }

        return res.status(200).json({ user })
    }

    static login = async (req, res) => {
        const { email, password } = req.body

        const user = await User.findOne({ email: email })

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!user || !checkPassword) {
            return res.status(404).json({ msg: "Usuário ou Senha incorreto!" })
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
}

const isNotEmailValid = async (email) => {
    const { is_reachable } = await checkSingle({ to_email: email }, { apiToken: process.env.API_TOKEN_REACHER })
    return is_reachable !== 'safe'
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

module.exports = UserController