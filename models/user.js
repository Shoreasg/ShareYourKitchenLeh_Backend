const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true
        },
        facebookId:
        {
            required: false,
            type: String
        },
        twitterId:
        {
            required: false,
            type: String
        },
        googleId:
        {
            required: false,
            type: String
        },
        groups: [{ type: mongoose.Types.ObjectId, ref: "Group2", required: true }]
    }
);

userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('User2', userSchema)