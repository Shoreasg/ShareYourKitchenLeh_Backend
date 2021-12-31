const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
router.use(express.static("public"))


router.get('/auth/facebook', passport.authenticate('facebook'));


router.get('/auth/twitter', passport.authenticate('twitter'));


router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));


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