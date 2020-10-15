// Load the SDK and UUID
const AWS = require('aws-sdk');
const express = require('express')
const app = express()
const cors = require('cors')
const {spawn} = require('child_process')
const UserNew = require('./models/User')
AWS.config.update({ region: 'us-east-1' });
const mongoose = require('mongoose')
const uri = "mongodb+srv://tievo:sdBVjd8GQGsw6Jag@lurien.1yjjv.mongodb.net/lurien?retryWrites=true&w=majority";

app.use(express.json())
app.use(cors())
app.on('uncaughtException', function (err) {
  console.log('pincho algo maybe');
});
const router = require('./routes/pito')
app.use('/ballena', router)


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log('successfully connected to database');
});

app.get('/messi', async(req,res)=>{
  mongoose.connection.useDb("lurien").collection("usernews")
  return res.json(await UserNew.findOne({dni:45583265}))
})

app.get('/messi2', async(req,res)=>{
  await mongoose.connection.useDb("lurien").collection("entradas").deleteMany({name:"tievo"})
  return res.json('yess')
})
app.listen(6969, ()=>{
  console.log("boca.")
  const py = spawn('python',['test.py'])
  
 })

