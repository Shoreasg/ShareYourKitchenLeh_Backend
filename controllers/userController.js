const User = require('./models/user')
const passport = require('passport')
const express = require('express')
const router = express.Router()


router.post('/signup',(req,res,next)=>{
    User.register(new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        function(err,user)
        {
            if (err){
                res.json({status: "Error registering"})
                return next(err);
            }
            res.redirect('/signup')
        }
    }),
    
    )
})
