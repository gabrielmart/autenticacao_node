const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

class UserController {
    static create = async (req, res) => {
        const { name, email, password, confirmPassword } = req.body

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
             res.status(422).json({ msg: "Por favor utilize outro email!" })
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
            res.status(201).json({ msg: 'Usuário criado com sucesso!' })
        } catch (error) {
            res.status(500).json({ msg: 'Houve um erro no servidor, tente novamente mais tarde!' })
        }
    }

    static readById = async (req, res) => {
        const id = req.params.id

        const user = await User.findById(id, '-password')

        if (!user) {
            res.status(404).json({ msg: 'Usuário não encontrado!' })
        }

        res.status(200).json({ user })
    }

    static login = async (req, res) => {
        const { email, password } = req.body

        if (!email) {
             res.status(422).json({ msg: 'O email é obrigatório!' })
        }

        if (!password) {
             res.status(422).json({ msg: 'O senha é obrigatória!' })
        }

        // check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
             res.status(404).json({ msg: "Usuário não encontrado!" })
        }

        //check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
             res.status(404).json({ msg: "Senha Inválida" })
        }

        try {
            const SECRET = process.env.SECRET

            const token = jwt.sign({
                id: user._id,
            },
                SECRET,
            )

            res.status(200).json({ msg: "Autenticacão realizada com sucesso", token })
        } catch (error) {
            res.status(500).json({ msg: 'Houve um erro no servidor, tente novamente mais tarde!' })
        }
    }
}

module.exports = UserController