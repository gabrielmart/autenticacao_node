const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const User = require('../models/User.model')
const RefreshToken = require('../models/RefreshToken.model')
const PasswordResetToken = require('../models/PasswordResetToken.model')
const UnauthorizedError = require('../errors/Unauthorized.error')
const ForbiddenError = require('../errors/Forbidden.error')
const UnprocessableEntity = require('../errors/UnprocessableEntity.error')

class AuthService {
    static login = async (req, res) => {
        const { email, password } = req.body

        const user = await User.findOne({ email: email })

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!user || !checkPassword) {
            throw new UnauthorizedError("Usuário ou Senha incorreto!")
        }

        if (user.status != 'Active') {
            throw new ForbiddenError("Conta pendente de confirmação. Por favor verifique seu email!")
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

        if (!oldRefreshToken) throw new UnauthorizedError('Refresh Token inválido!')

        if (oldRefreshToken.isExpired || !oldRefreshToken.isActive) {
            throw new ForbiddenError('Refresh Token está inativado ou expirado!')
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

        const user = await User.findOne({ confirmationCode })

        if (!user || user.status === "Active") {
            throw new UnprocessableEntity('Requisição Inválida!')
        }

        user.status = "Active"
        user.confirmationCode = ''
        user.save()

        return res.status(200).json({ msg: "Usuário confirmado!" })
    }

    static createPasswordReset = async (req, res) => {
        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            throw new UnprocessableEntity('Não existe usuário com esse email!')
        }

        const passwordResetToken = await generatePasswordResetToken(user)

        const urlPasswordReset = generateUrlpasswordReset(req, user, passwordResetToken)

        await sendEmail(urlPasswordReset, user.name, user.email)

        return res.status(201).json({ msg: 'Recuperação de senha enviada, por favor verifique seu email!' })
    }

    static passwordReset = async (req, res) => {
        const { userId, token: passwordResettoken } = req.params
        const { password } = req.body

        const user = await User.findById(userId)
        const token = await PasswordResetToken.findOne({ token: passwordResettoken })

        if (!user || !token) {
            throw new UnprocessableEntity('Url invalida!')
        }

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        user.password = passwordHash

        await user.save()
        await token.delete()

        res.status(200).json({ msg: 'Senha recuperada com sucesso!' })
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

const generatePasswordResetToken = async (user) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    const token = jwt.sign({ email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

    const passwordReset = new PasswordResetToken({
        user: user.id,
        token,
        expires: new Date(jwt.decode(token).exp * 1000),
    })

    await passwordReset.save()
    return token
}

const generateUrlpasswordReset = (req, user, passwordResetToken) => {
    const protocol = req.protocol
    const hostname = req.get('host')
    const fullUrl = `${protocol}://${hostname}/auth/passwordReset/${user._id}/${passwordResetToken}`

    return fullUrl
}

const sendEmail = async (url, name, recipentEmail) => {
    const senderEmail = process.env.EMAIL_SENDER
    const passwordSenderEmail = process.env.PASSWORD_EMAIL_SENDER

    const transporter = nodemailer.createTransport({
        name: '', // TODO: Obter dominio valido
        service: process.env.SERVICE_EMAIL_SENDER,
        auth: {
            user: senderEmail,
            pass: passwordSenderEmail
        }
    })

    await transporter.sendMail({
        from: 'Autentication Node',
        to: recipentEmail,
        subject: 'Recuperação de Senha',
        html: `<div>
                <h1>Recuperação de Senha</h1>
                <h2>Olá ${name}</h2>
                <p>Para gerar uma nova senha clique no link a seguir</p>
                <a href=${url}>Clique Aqui!</a>
            </div>`
    })

}

module.exports = AuthService