// Load the SDK and UUID
const AWS = require('aws-sdk');
const express = require('express')
const app = express()
const cors = require('cors')
const {spawn} = require('child_process')
AWS.config.update({ region: 'us-east-1' });
const mongoose = require('mongoose')
const uri = "mongodb+srv://tievo:sdBVjd8GQGsw6Jag@lurien.1yjjv.mongodb.net/lurien?retryWrites=true&w=majority";

app.use(express.json())
app.use(cors())
const router = require('./routes/pito')
app.use('/ballena', router)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log('successfully connected to database');
});

app.listen(6969, ()=>{
  console.log("boca.")
  const py = spawn('python',['test.py'])
  
 })

