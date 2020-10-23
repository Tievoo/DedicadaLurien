// Load the SDK and UUID
const AWS = require('aws-sdk');
const express = require('express')
const app = express()
const cors = require('cors')
const {spawn} = require('child_process')
const UserNew = require('./models/User')
AWS.config.update({ region: 'us-east-1' });
const mongoose = require('mongoose')
var admin = require("firebase-admin")
var firebase = require("firebase")
require('firebase/storage')
require('firebase/auth')
require('dotenv').config()
global.XMLHttpRequest = require("xhr2");
var serviceAccount = 'firebase.json'
const uri = "mongodb+srv://tievo:sdBVjd8GQGsw6Jag@lurien.1yjjv.mongodb.net/lurien?retryWrites=true&w=majority";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "test-lurien.appspot.com"
});
var firebaseConfig = {
  apiKey: "AIzaSyBvvZR8bjCKg8kGxXviw43j_iv2Kp3Zgtw",
  authDomain: "test-lurien.firebaseapp.com",
  databaseURL: "https://test-lurien.firebaseio.com",
  projectId: "test-lurien",
  storageBucket: "test-lurien.appspot.com",
  messagingSenderId: "973221769406",
  appId: "1:973221769406:web:2653edd347f49bda3ceeef",
  measurementId: "G-HJ0BJ08H7L"
};
firebase.initializeApp(firebaseConfig)

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

app.get('/messi3', async(req,res)=>{
  
})

app.get('/messi2', async(req,res)=>{
  await mongoose.connection.useDb("lurien").collection("entradas").deleteMany({name:"tievo"})
  return res.json('yess')
})
app.listen(6969, async ()=>{
  console.log("boca.")
  
  var tkn = await admin.auth().createCustomToken("baruj ata", { hidden: process.env.hidden })
  firebase.auth().signInWithCustomToken(tkn)
  const py = spawn('python',['test.py', process.env.CAMERA]) 
 })

