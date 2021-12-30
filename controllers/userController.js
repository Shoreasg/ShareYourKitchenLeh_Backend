const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
router.use(express.static("public"))

router.post('/signup', async (req, res, next) => {
  await User.register(new User({ username: req.body.username }), req.body.password, (err) => {
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
          req.logIn(user, (err) => {
            if (err) { return next(err) }
            return res.send({ message: "User registered and login Successful" })
          })
        }
      })(req, res, next)
    }
  });
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


router.delete('/logout', async (req, res) => {

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