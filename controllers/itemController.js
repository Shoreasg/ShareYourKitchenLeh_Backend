const express = require('express')
const item = require('../models/items')
const router = express.Router();




// create new item
router.post('/create',async(req,res)=>
{
    const convertExpirydate = new Date(req.body.expiryDate)
    await item.create(req.body);
    res.send({message: "Item created successfully"})
})


// show all items
router.get('/show',async(req,res)=>
{
    const foundItems = await item.find({})
    res.send(foundItems)
})

// Show one item(For edit page)


//delete

module.exports = router
