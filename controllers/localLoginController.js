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


passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy

router.post('/signup', async (req, res, next) => { 
  const findUser = await User.findOne({ email : req.body.email })//when user click signup, this will find the user by the email that they input
  if (!findUser) {//if no email found in DB, register the user.
    await User.register(new User({ username: req.body.username, email: req.body.email, resetToken: randtoken.generate(30) }), req.body.password, (err) => {
      if (err) { //if any error while registering, send the error message(cases like exisitng user name)
        res.status(400)
        res.send(err)
        return next()
      }
      else {
        passport.authenticate('local', (err, user) => { // if no error, then we authenticate the user after sign up
          if (err) {
            res.status(400)
            return res.send({ message: err })
          } else {
            req.logIn(user, async (err) => { // if authenticate success, we log the user in.
              if (err) { return next(err) }
              const createNewGRP = await Group.create({ //after that we create a default group for the user
                grpName: `${req.body.username}-personal`,
                members: [user._id],
                ownerID: user._id
              })
              const WelcomeEmail = { //we send a email to welcome the user
                from: 'ShareYourKitchenLeh <garyganweilun@gmail.com>',
                to: req.body.email,
                subject: 'Registeration Successful',
                html: `
              <h1>Registration Successful</h1>
              <p>Dear ${req.body.username}, Your Account is registered successfully.<p>`
              };

              mg.messages().send(WelcomeEmail)

              await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true }) // we get the user._id and update the user as admin of the group
              return res.send({ message: "User registered and login Successful" })
            })
          }
        })(req, res, next)
      }
    })
  }
  else // if email found in our DB, we tell user that the email is registered.
  {
  res.status(400)
  res.send({message:'A user with the given email is already registered'})
  }
})

router.post('/login', async (req, res, next) => { // this is to login the user
  await passport.authenticate('local', (err, user, info) => { // check if the user details and password are in our DB
    if (err) { // if error, then send an error
      res.status(400)
      return res.send({ message: err })
    }
    if (!user) { // if user not found, we tell user that the credentials that they entered is incorrect.
      res.status(400)
      return res.send({ message: "Password or username is incorrect" })
    }
    req.logIn(user, (err) => { // else, means user found, we log the user in and tell user that he login successfully
      if (err) { return next(err) }
      return res.send({ message: "User login Successful" })
    })
  })(req, res, next)

});

router.get('/getlogin', (req, res) => { // this is to check the user session.
  res.send(req.user)
})

router.post('/checkemail', async (req, res) => { // this is for forgot password function. User will enter their email. If email found, send reset password email, else tell user email not found
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
              <p>Dear ${findUser.username}, click this <a href="${process.env.FRONTEND_URL}/reset/${findUser.resetToken}">link</a> to reset password</p>`
  };
  mg.messages().send(ResetEmail)
  return res.send({ message: "Email found" })
})

router.get('/checktoken/:token',async (req,res)=> // this is to check if the resetToken exist. If not, send invalid token.
{
  const findToken = await User.findOne({resetToken: req.params.token})
  if(!findToken)
  {
    res.status(401)
    return res.send({message: "Invalid token"})
  }
  res.send({message: "Valid token"})
})


router.post('/resetpassword', async (req, res) => { // this will be use after checking if there is a valid token. Alow the user to update the password.
  const foundUser = await User.findOne({ resetToken : req.body.resetToken })
  if (foundUser) {
    await foundUser.setPassword(req.body.password);
    foundUser.resetToken = randtoken.generate(30)
  }
  else
    return res.send({ message: "Server Error" })

  const updatePassword = await foundUser.save();
  if (updatePassword) {
    if (!updatePassword) {
      res.send({ message: "Password update failure (Server error)" })
    }
    return res.send({ message: "Password updated Successfully" })
  }
})


router.delete('/logout', (req, res) => { //this will log the user out. Clear the cookies to remove any session

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