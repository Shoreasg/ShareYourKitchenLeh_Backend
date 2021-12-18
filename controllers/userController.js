const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
router.use(express.static("public"))

router.post('/signup', async (req, res, next) => {
  await User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, (err) => {
    if (err) {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        res.send({ name: "EmailExistsError", message: 'A user with the given email is already registered' })
        return next()
      } else
        res.send(err)
      return next()
    }else{
        passport.authenticate('local', (err) => {
            if (err) {
              return res.send({ message: err })
            }
            res.send({ message: "User registered and login Successful" })
        
          })(req,res,next)
        

    }
  });
})

router.post('/login', async (req, res,next) => {
  await passport.authenticate('local', (err, thisModel) => {
    if (err) {
      return res.send({ message: err })
    }
    if (!thisModel) {
      return res.send({ message: "Password or username or email is incorrect" })
    }
    res.send({ message: "User login Successful" })

  })(req,res,next)



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