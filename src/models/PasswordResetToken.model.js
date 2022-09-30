const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
}, {
    virtuals: {
        isExpired: {
            get() {
                return Date.now() >= this.expires
            }
        }
    }
})

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
})

const PasswordResetToken = mongoose.model('PasswordResetToken', schema)

module.exports = PasswordResetToken