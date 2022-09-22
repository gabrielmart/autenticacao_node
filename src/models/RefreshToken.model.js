const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    revoked: Date,
    replacedbyToken: String
})

schema.virtual('isExpired').get(() =>  Date.now() >= this.expires);

schema.virtual('isActive').get(() => !this.revoked && !this.isExpired);

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
})

const RefreshToken = mongoose.model('RefreshToken', schema)

module.exports = RefreshToken