const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const fs = require('fs')
const axios = require('axios')
var fileContent;
var url = 'http://localhost:8080';
var firebase = require("firebase")
require('firebase/storage')
const UserNew = require('../models/User');
var mongoose = require('mongoose')
const rekognition = new AWS.Rekognition();
const Entrada = mongoose.model('Entrada', new mongoose.Schema({ dni: Number, name: String, hour: String, img: String }));
class AWSManager {
    constructor() { }
    createBucket = (BUCKET_NAME) => {
        s3.createBucket({ Bucket: BUCKET_NAME }, function (err, data) {
            if (err) console.log(err, err.stack)
            else {
                console.log('done', data.location)
            }
        })
    }

    uploadPhotoToBucket = (BUCKET_NAME) => {
        const photo_params = {
            Bucket: BUCKET_NAME,
            Key: filename, // File name you want to save as in S3
            Body: fileContent
        };

        s3.upload(photo_params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });

    }
    createCollection = (parametros) => {
        rekognition.createCollection(parametros, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }

    deleteCollection = (parametros) => {
        rekognition.deleteCollection(parametros, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }

    addFace = (parametros) => {
        rekognition.indexFaces(parametros, function (err, data) {
            if (err) console.log('no', err); // an error occurred
            else {
                console.log(data)
                // data['FaceRecords'].forEach(element =>{

                //   console.log(element['Face'].FaceId)
                // })
            }           // successful response
        });
    }

    deleteFaces = (parametros) => {
        rekognition.deleteFaces(parametros, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successfl response
        });
    }

    listCollections = (collection_params) => {
        rekognition.listCollections(collection_params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data['CollectionIds']);           // successful response
        });
    }

    listFaces = (faces_params) => {
        rekognition.listFaces(faces_params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }

    findDuplicates = (arr) => {
        let sorted_arr = arr.slice().sort();
        let results = [];
        for (let i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        if (results.length != 0) {
            return results[0]
        }
        else return null
    }

    createErrMsg(err, msg) {
        let returning = {
            msgError: err,
            data: {
                message: msg
            }
        }
        return returning
    }

    searchByImage = async (parametros, pin, callback) => {
        var faceIdArray = []
        rekognition.searchFacesByImage(parametros, async (err, data) => {
            if (err) {
                console.log(err, err.stack);
                //callback(user.companyID, user.dni, hora, user.username, this.createErrMsg(true, 'AWS ERROR (No face in camera?)'))

            }  // an error occurred
            else {
                mongoose.connection.useDb("lurien").collection("usernews")
                console.log(pin)
                const user = await UserNew.findOne({ qrPin: pin })
                if (user) {
                    var success = 0;
                    data['FaceMatches'].forEach(async (element) => {
                        faceIdArray.push(element['Face'].ExternalImageId)
                    })

                    for (var key in faceIdArray) {
                        if (String(faceIdArray[key]) === String(user.dni)) {
                            success++;
                        }
                    }
                    if (success >= 2) {
                        var date = new Date()
                        var hora = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()}/${date.getMonth() + 1}`
                        
                        callback(user.companyID, user.dni, hora, user.username)


                    } else {
                        if (faceIdArray.length >= 2) {
                            let dniUnk = this.findDuplicates(faceIdArray)
                            if (dniUnk != null) {
                                const newUser = await UserNew.findOne({ dni: dniUnk })
                                callback(user.companyID, user.dni, hora, user.username, this.createErrMsg(true, ('Se reconoció la cara de ' + newUser.username + ', pero el QR de ' + user.username)))


                            } else callback(user.companyID, user.dni, hora, user.username, this.createErrMsg(true, ('error inesperado')))

                        } else callback(user.companyID, user.dni, hora, user.username, this.createErrMsg(true, 'No se reconoce la cara. Reentrena tu modelo.'))
                    }
                } else callback(null, null, null, null, this.createErrMsg(true, 'No existe usuario con ese QR'))

            }
        });

    }

}
const manager = new AWSManager()
var params = {
    CollectionId: 'dedicada' /* required */
};



router.get('/tool', async (req, res) => {

})

router.get('/pollo/:id', async (req, res) => {
    //console.log(req.params.id)



    fileContent = fs.readFileSync('testimage.png')
    var searchParams = {
        CollectionId: '1a2b3c', //podemos usar .env para esto or sth o un json interno que se arme con el instalador, por que si no, solo con el qr no hay forma de saber la compID
        FaceMatchThreshold: 95,
        Image: {
            Bytes: Buffer.from(fileContent)
        },
        MaxFaces: 5
    }
    manager.searchByImage(searchParams, req.params.id, async (compid, dni, hour, name, err) => {
        if (err) {
            console.log(err)
            return res.json(err)
        }
        else {
            console.log('on it')
            mongoose.connection.useDb("lurien").collection("entradas")//lurien seria reemplazado por company id
            var bod = fileContent
            var img = ""
            await firebase.storage().ref(`1a2b3c/entradas/${dni}${Date.now()}.png`).put(bod, {contentType:'image/png'}).then(snap => {
                snap.ref.getDownloadURL().then(img => {
                    axios.post(`${url}/api/debug/companyid`, {
                        name,
                        hour,
                        companyid: compid,
                        img
                    })
                    const newEntry = new Entrada({ dni, hour, name, img })
                    newEntry.save(function (err) {
                        fs.unlinkSync('testimage.png')
                        console.log('picado')
                        return res.json('Salio bien')
                    })
                })
            })
        }
    })
})

module.exports = router