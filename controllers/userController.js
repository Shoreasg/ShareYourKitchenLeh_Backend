const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
router.use(express.static("public"))
router.use(express.urlencoded())

router.post('/signup', async (req,res,next)=>
{
   await User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err) {
        if (err.name ==='MongoServerError' && err.code === 11000) {
          res.send({name: "EmailExistsError", message: 'A user with the given email is already registered'})
          return next(err)
        }else if(err)
        {
          res.send(err)
          return next(err)
          
        }
        res.send({message: "User registered successfully!"})
      });
})

module.exports = router