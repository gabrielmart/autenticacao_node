const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { checkSingle } = require('@reacherhq/api')
const nodemailer = require('nodemailer')
const User = require('../models/User.model')

class UserService {
    static create = async (req, res) => {
        const { name, email, password } = req.body

        const isNotValid = await isNotEmailValid(email)

        if (isNotValid) {
            return res.status(422).json({ msg: "Email Inválido!" })
        }

        const userExists = await User.findOne({ email: email })

        if (userExists) {
            return res.status(422).json({ msg: "Por favor utilize outro email, pois já existe um usuário utilizando!" })
        }

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const confirmationCode = generateConfirmationCode(email)

        const user = new User({
            name,
            email,
            password: passwordHash,
            confirmationCode
        })

        const urlEmailConfirmation = generateUrlEmailConfirmation(req, confirmationCode)

        try {
            await user.save()
            await sendEmail(urlEmailConfirmation, name, email)

            return res.status(201).json({ msg: 'Usuário criado com sucesso, por favor verifique seu email!' })
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
}

const isNotEmailValid = async (email) => {
    const { is_reachable } = await checkSingle({ to_email: email }, { apiToken: process.env.API_TOKEN_REACHER })
    return is_reachable !== 'safe'
}

const generateConfirmationCode = (email) => {
    const CONFIRMATION_CODE_SECRET = process.env.CONFIRMATION_CODE_SECRET
    return jwt.sign({ email }, CONFIRMATION_CODE_SECRET)
}

const generateUrlEmailConfirmation = (req, confirmationCode) => {
    const protocol = req.protocol
    const hostname = req.get('host')
    const fullUrl = `${protocol}://${hostname}/auth/confirmationEmail/${confirmationCode}`

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
        subject: 'Confirmação de Cadastro',
        html: `<div>
                <h1>Confirmação de Cadastro</h1>
                <h2>Olá ${name}</h2>
                <p>Obrigado por inscrever-se. Por favor confirme seu email clicando link a seguir</p>
                <a href=${url}>Clique Aqui!</a>
            </div>`
    })

}

module.exports = UserService