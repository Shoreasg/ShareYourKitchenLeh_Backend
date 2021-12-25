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
    } else {
      passport.authenticate('local', (err) => {
        if (err) {
          return res.send({ message: err })
        }
        res.send({ message: "User registered and login Successful" })

      })(req, res, next)


    }
  });
})

router.post('/login', async (req, res, next) => {
  await passport.authenticate('local', (err, thisModel) => {
    if (err) {
      res.status(400)
      return res.send({ message: err })
    }
    if (!thisModel) {
      res.status(400)
      return res.send({ message: "Password or username is incorrect" })
    }
    res.send({ message: "User login Successful" })

  })(req, res, next)



})


router.post('/logout', async (req, res, next) => {

  if (req.session) {

    req.logout();
    req.session.destroy((err) => {
      if (err) {
        res.send(err)
      } else {
        res.send({ message: "You are successfully logged out!" })
      }
    })

  }
  else {
    res.send({ message: "You are not logged in!" })
    next();
  }



})

module.exports = router