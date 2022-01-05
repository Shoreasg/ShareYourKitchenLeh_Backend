const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const Group = require('../models/Group')
const router = express.Router()
router.use(express.static("public"))
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'],
    clientSecret: process.env['FACEBOOK_APP_SECRET'],
    callbackURL: "/redirect/facebook",
    profileFields: ['id', 'emails', 'displayName']

},
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
         User.findOne({
            email: profile._json.email
        }, async (err, user) => {
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
                        facebookId: profile.id,
                        email: profile._json.email
                    }
                );
                const createNewGRP = await Group.create({
                    grpName: `${user.username}-personal`,
                    members: [user._id],
                    ownerID: user._id
                })


                user.save(async err => {
                    if (err) {
                        throw err
                    }
                    await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })
                    return done(err, user)
                })

            }
        });

    }
));



passport.use(new TwitterStrategy({
    consumerKey: process.env['TWITTER_API_KEY'],
    consumerSecret: process.env['TWITTER_API_SECRET'],
    callbackURL: "/redirect/twitter",
    includeEmail: true
},
    async (token, tokenSecret, profile, done) => {
        console.log(profile)
        User.findOne({
            email: profile._json.email
        }, async (err, user) => {
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
                        twitterId: profile.id,
                        email: profile._json.email
                    }
                );
                const createNewGRP = await Group.create({
                    grpName: `${user.username}-personal`,
                    members: [user._id],
                    ownerID: user._id
                })
                user.save(async err => {
                    if (err) {
                        throw err
                    }
                    await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })
                    return done(err, user)
                })
            }
        });

    }
));


passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: "/redirect/google"
}, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    User.findOne({
        email: profile._json.email
    }, async (err, user) => {
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
                    googleId: profile.id,
                    email: profile._json.email
                }
            );
            const createNewGRP = await Group.create({
                grpName: `${user.username}-personal`,
                members: [user._id],
                ownerID: user._id
            })
            user.save(async err => {
                if (err) {
                    throw err
                }
                await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })
                return done(err, user)
            })
        }
    })

}
));

router.get('/auth/facebook', passport.authenticate('facebook',{ scope : ['email'] }));


router.get('/auth/twitter', passport.authenticate('twitter'));


router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));


router.get('/redirect/facebook',
    passport.authenticate('facebook'),
    (req, res) => {
        res.redirect("http://localhost:3000/")
    });


router.get('/redirect/twitter',
    passport.authenticate('twitter'),
    (req, res) => {
        res.redirect("http://localhost:3000/")
    });

router.get('/redirect/google',
    passport.authenticate('google'),
    (req, res) => {
        res.redirect("http://localhost:3000/");
    });


router.get('/getlogin', (req, res) => {
    res.send(req.user)
})


router.delete('/logout', (req, res) => {

    if (req.session) {
        req.logOut()
        req.session.destroy((err) => {
            if (err) {
                res.send(err)
            } else {
                res.clearCookie('connect.sid')
                res.send({ message: "You are successfully logged out!" })
            }
        })

    }
    else {
        res.send({ message: "You are not logged in!" })
    }
})
module.exports = router