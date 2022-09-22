const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const RefreshToken = require('../models/RefreshToken.model')

class UserController {
    static create = async (req, res) => {
        const { name, email, password } = req.body

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

        const accessToken = generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        return res.status(200).json({ msg: "Autenticacão realizada com sucesso", token: accessToken, refreshToken: refreshToken.token })
    }
}

const generateAccessToken = (user) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    return jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = async (user) => {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
    const token = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' })

    const refreshToken = new RefreshToken({
        user: user.id,
        token,
        expires: new Date(jwt.decode(token).exp * 1000)
    })

    await refreshToken.save()

    return refreshToken
}

module.exports = UserController