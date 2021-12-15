const mongoose = require('mongoose')
const app=require('./app')
require('dotenv').config();
const PORT = process.env.PORT||8000;
const DATABASE=process.env.DATABASE;
const MONGO_USER=process.env.MONGO_USER;
const MONGO_PASSWORD=process.env.MONGO_PASSWORD;
const MONGO_BASE_URL=process.env.MONGO_BASE_URL;
const MONGO_URL=`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_BASE_URL}/${DATABASE}?retryWrites=true&w=majority`
mongoose.connect(MONGO_URL).then(()=>{
  console.log('database connected')
  app.listen(PORT, () => { console.log('listening on', PORT) });
})