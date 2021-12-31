const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user')
const app = express();
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'], credentials: true }));
const userController = require('./controllers/userController')
const socialController = require('./controllers/socialController')


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));


// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'],
    clientSecret: process.env['FACEBOOK_APP_SECRET'],
    callbackURL: "/redirect/facebook"

},
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
     await User.findOne({
            'username': profile.displayName
        }, (err, user) => {
            if (err) {
                return done(err);
            } if (user) {
                if (user.facebookId == undefined) {
                    user.facebookId = profile.id
                    user.save();
                }
                return done(err, user);
            }
            else {
                user = new User(
                    {
                        username: profile.displayName,
                        facebookId: profile.id
                    }
                );
                user.save(err => {
                    if (err) {
                        throw err
                    }
                    return done(err, user)
                })
            }
        }).clone();

    }
));



passport.use(new TwitterStrategy({
    consumerKey: process.env['TWITTER_API_KEY'],
    consumerSecret: process.env['TWITTER_API_SECRET'],
    callbackURL: "/redirect/twitter"

},
    async (token, tokenSecret, profile, done) => {
        console.log(profile)
      await User.findOne({
            'username': profile.displayName
        }, (err, user) => {
            if (err) {
                return done(err);
            } if (user) {
                if (user.twitterId == undefined) {
                    user.twitterId = profile.id
                    user.save();
                }
                return done(err, user);
            }
            else {
                user = new User(
                    {
                        username: profile.displayName,
                        twitterId: profile.id
                    }
                );
                user.save(err => {
                    if (err) {
                        throw err
                    }
                    return done(err, user)
                })
            }
        }).clone();

    }
));


passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: "/redirect/google"
}, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    await User.findOne({
        'username': profile.displayName
    }, (err, user) => {
        if (err) {
            return done(err);
        } if (user) {
            if (user.googleId == undefined) {
                user.googleId = profile.id
                user.save();
            }
            return done(err, user);
        }
        else {
            user = new User(
                {
                    username: profile.displayName,
                    googleId: profile.id
                }
            );
            user.save(err => {
                if (err) {
                    throw err
                }
                return done(err, user)
            })
        }
    }).clone();

}
));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(socialController)
app.use(userController)




module.exports = app