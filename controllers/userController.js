const passport = require('passport')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
router.use(express.static("public"))
router.use(express.urlencoded())

router.post('/signup',(req,res,next)=>
{
    User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err) {
        if (err) {
          console.log('error while user register!', err);
          return next(err);
        }
    
        console.log('user registered!');
    
        res.redirect('/');
      });
})

module.exports = router