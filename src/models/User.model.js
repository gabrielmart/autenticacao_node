const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    name: String,
    email: String,
    password: String,
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: {
        type: String,
        unique: true
    }
})

const User = mongoose.model('User', schema)

module.exports = User