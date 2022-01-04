const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const Group = require('../models/Group')
const router = express.Router()
router.use(express.static("public"))
const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(User.authenticate()));

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
          req.logIn(user, async (err) => {
            if (err) { return next(err) }
            const createNewGRP = await Group.create({
              grpName: `${req.body.username}-personal`,
              members: [user._id],
              ownerID: user._id
            })
            await User.findByIdAndUpdate(user._id, { groups: createNewGRP._id }, { new: true })
            return res.send({ message: "User registered and login Successful" })
          })
        }
      })(req, res, next)
    }
  })
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

router.get('/checkusername/:username', async (req, res) => {
  const findUser = await User.findOne({ "username": req.params.username })
  if (!findUser) {
    return res.send({ message: "user not found" })
  }

  return res.send({ message: "user found" })
})

router.post('/setnewpassword', async (req, res) => {
  const foundUser = await User.findOne({ "username": req.body.username })
  await foundUser.setPassword(req.body.password);
  const updatePassword = await foundUser.save();
  if (updatePassword) {
    if (!updatePassword) {
      res.send({ message: "Password update failure (Server error)" })
    }
    return res.send({ message: "Password updated" })
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