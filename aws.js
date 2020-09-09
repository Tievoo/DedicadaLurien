// Load the SDK and UUID
const AWS = require('aws-sdk');
const fs = require('fs')
const express = require('express')
const app = express()
const cors = require('cors')
const UserNew = require('./models/User')
AWS.config.update({ region: 'us-east-1' });
const mongoose = require('mongoose')
const uri = 'mongodb://localhost:27017/mernauth'

app.use(express.json())
app.use(cors())
const router = require('./routes/pito')
app.use('/ballena', router)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log('successfully connected to database');
});

var nombre; //esto sería posteriormente reemplazado con el PIN de Seguridad
var faceIdArray = []

app.listen(6969, ()=>{
  console.log("boca.")
})
