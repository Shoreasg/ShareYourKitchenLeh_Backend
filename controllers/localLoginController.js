const passport = require('passport')
const randtoken = require('rand-token');
require("dotenv").config();
const mailgun = require('mailgun-js');
const express = require('express')
const User = require('../models/user')
const Group = require('../models/Group')
const router = express.Router()
router.use(express.static("public"))
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
const LocalStrategy = require('passport-local').Strategy


passport.use(new LocalStrategy(User.authenticate()));

router.post('/signup', async (req, res, next) => {
  const findUser = await User.findOne({ email : req.body.email })
  if (!findUser) {
    await User.register(new User({ username: req.body.username, email: req.body.email, resetToken: randtoken.generate(30) }), req.body.password, (err) => {
      if (err) {
        res.status(400)
        res.send(err)
        return next()
      }
      else {
        passport.authenticate('local', (err, user) => {
          if (err) {
            res.status(400)
            return res.send({ message: err })
          } else {
            req.logIn(user, async (err) => {
              if (err) { return next(err) }
              const createNewGRP = await Group.create({
                grpName: `${req.body.username}-personal`,
                members: [user._id],
                ownerID: user._id
              })
              const WelcomeEmail = {
                from: 'ShareYourKitchenLeh <garyganweilun@gmail.com>',
                to: req.body.email,
                subject: 'Registeration Successful',
                html: `
              <h1>Registration Successful</h1>
              <p>Dear ${req.body.username}, Your Account is registered successfully.<p>`
              };

              mg.messages().send(WelcomeEmail)

              await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })
              return res.send({ message: "User registered and login Successful" })
            })
          }
        })(req, res, next)
      }
    })
  }
  else
  {
  res.status(400)
  res.send({message:'A user with the given email is already registered'})
  }
})

router.post('/login', async (req, res, next) => {
  await passport.authenticate('local', (err, user, info) => {
    if (err) {
      res.status(400)
      return res.send({ message: err })
    }
    if (!user) {
      res.status(400)
      return res.send({ message: "Password or username is incorrect" })
    }
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      return res.send({ message: "User login Successful" })
    })
  })(req, res, next)

});

router.get('/getlogin', (req, res) => {
  res.send(req.user)
})

router.post('/checkemail', async (req, res) => {
  const findUser = await User.findOne({ email : req.body.email })
  if (!findUser) {
    return res.send({ message: "Email not found" })
  }
  const ResetEmail = {
    from: 'ShareYourKitchenLeh <garyganweilun@gmail.com>',
    to: req.body.email,
    subject: 'Reset your password',
    html: `
              <h1>Reset password</h1>
              <p>Dear ${findUser.username}, click this <a href="http://localhost:3000/reset/${findUser.resetToken}">link</a> to reset password</p>`
  };
  mg.messages().send(ResetEmail)
  return res.send({ message: "Email found" })
})


router.post('/resetpassword', async (req, res) => {
  const foundUser = await User.findOne({ resetToken : req.body.resetToken })
  if (foundUser) {
    await foundUser.setPassword(req.body.password);
    foundUser.resetToken = randtoken.generate(30)
  }
  else
    return res.send({ message: "Invalid Token" })

  const updatePassword = await foundUser.save();
  if (updatePassword) {
    if (!updatePassword) {
      res.send({ message: "Password update failure (Server error)" })
    }
    return res.send({ message: "Password updated Successfully" })
  }
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