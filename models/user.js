const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema(
    {
<<<<<<< HEAD

=======
>>>>>>> ce42b38606adc969c5650109f33e1f8ac8d0e489
        username: {
            type: String,
            unique: true,
            required: true
        }
    }
);

userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', userSchema)