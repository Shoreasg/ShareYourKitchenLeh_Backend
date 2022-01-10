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
        email: {
            required: true,
            unique: true,
            type: String
        },
        groups: [{ type: mongoose.Types.ObjectId, ref: "Group", required: true }],
        resetToken:{
            type: String
        }
    }
);

userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', userSchema)