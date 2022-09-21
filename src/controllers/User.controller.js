const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')

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

        // check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
             return res.status(404).json({ msg: "Usuário não encontrado!" })
        }

        //check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
             return res.status(404).json({ msg: "Senha Inválida" })
        }

        try {
            const SECRET = process.env.SECRET

            const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: 900 }
            )

            return res.status(200).json({ msg: "Autenticacão realizada com sucesso", token })
        } catch (error) {
            return res.status(500).json({ msg: 'Houve um erro no servidor, tente novamente mais tarde!' })
        }
    }
}

module.exports = UserController