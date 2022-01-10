const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const Group = require('../models/Group')
const router = express.Router()
router.use(express.static("public"))
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new FacebookStrategy({ //this is to define the facebook params. After user is authenticated, will trigger callback url 
    clientID: process.env['FACEBOOK_APP_ID'],
    clientSecret: process.env['FACEBOOK_APP_SECRET'],
    callbackURL: "/redirect/facebook",
    profileFields: ['id', 'emails', 'displayName']

},
    async (accessToken, refreshToken, profile, done) => { //find if the user who is login through facebook exist in our system
        console.log(profile)
         User.findOne({ //find the user by using the facebook responsed email.
            email: profile._json.email
        }, async (err, user) => {
            if (err) {
                return done(err);
            } if (user) { //if found, means user email exist in our system, we bind the facebook account to the exisitng user account
                if (user.facebookId == undefined) {
                    user.facebookId = profile.id
                    user.save();
                }
                return done(err, user);
            }
            else {
                user = new User( // if not found, we create a new account for the user where we use the display name of facebook as username
                    {
                        username: profile.displayName,
                        facebookId: profile.id,
                        email: profile._json.email
                    }
                );
                const createNewGRP = await Group.create({ //create a default group for the user
                    grpName: `${user.username}-personal`,
                    members: [user._id],
                    ownerID: user._id
                })


                user.save(async err => {
                    if (err) {
                        throw err
                    }
                    await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true }) // bind the group to the user.
                    return done(err, user)
                })

            }
        });

    }
));



passport.use(new TwitterStrategy({ //this is to define the twitter params. After user is authenticated, will trigger callback url 
    consumerKey: process.env['TWITTER_API_KEY'],
    consumerSecret: process.env['TWITTER_API_SECRET'],
    callbackURL: "/redirect/twitter",
    includeEmail: true
},
    async (token, tokenSecret, profile, done) => { //find if the user who is login through twitter exist in our system
        console.log(profile)
        User.findOne({  //find the user by using the twitter responded email.
            email: profile._json.email
        }, async (err, user) => {
            if (err) {
                return done(err);
            } if (user) { //if found, means user email exist in our system, we bind the twitter account to the exisitng user account
                if (user.twitterId == undefined) {
                    user.twitterId = profile.id
                    user.save();
                }
                return done(err, user);
            }
            else {
                user = new User( // if not found, we create a new account for the user where we use the display name of twitter as username
                    {
                        username: profile.displayName,
                        twitterId: profile.id,
                        email: profile._json.email
                    }
                );
                const createNewGRP = await Group.create({  //create a default group for the user
                    grpName: `${user.username}-personal`,
                    members: [user._id],
                    ownerID: user._id
                })
                user.save(async err => {
                    if (err) {
                        throw err
                    }
                    await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })// bind the group to the user.
                    return done(err, user)
                })
            }
        });

    }
));


passport.use(new GoogleStrategy({ //this is to define the Google params. After user is authenticated, will trigger callback url 
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: "/redirect/google"
}, async (accessToken, refreshToken, profile, done) => { //find if the user who is login through Google exist in our system
    console.log(profile)
    User.findOne({ //find the user by using the Google responded email.
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
            const createNewGRP = await Group.create({  //create a default group for the user
                grpName: `${user.username}-personal`,
                members: [user._id],
                ownerID: user._id
            })
            user.save(async err => {
                if (err) {
                    throw err
                }
                await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })// bind the group to the user.
                return done(err, user)
            })
        }
    })

}
));

router.get('/auth/facebook', passport.authenticate('facebook',{ scope : ['email'] })); // a route that, when the button is clicked, will redirect the user to Facebook, where they will authenticate.


router.get('/auth/twitter', passport.authenticate('twitter'));// a route that, when the button is clicked, will redirect the user to twitter, where they will authenticate.


router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] })); // a route that, when the button is clicked, will redirect the user to google, where they will authenticate.


router.get('/redirect/facebook', //after authenticate successful, this URL will be triggered. Now to tell our backend to redirect user to the homepage
    passport.authenticate('facebook'),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}`)
    });


router.get('/redirect/twitter', //after authenticate successful, this URL will be triggered. Now to tell our backend to redirect user to the homepage
    passport.authenticate('twitter'),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}`)
    });

router.get('/redirect/google', //after authenticate successful, this URL will be triggered. Now to tell our backend to redirect user to the homepage
    passport.authenticate('google'),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}`);
    });



router.delete('/logout', (req, res) => { //log the user out and clearing cookies

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