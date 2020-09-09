const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const fs = require('fs')
var fileContent;
var nombre;
const UserNew = require('../models/User')
const rekognition = new AWS.Rekognition();
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
            else console.log(data);           // successful response
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

    searchByImage = async (parametros, nombre,res) => {
        var faceIdArray = []
        rekognition.searchFacesByImage(parametros, async (err, data) => {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                const user = await UserNew.findOne({ username: nombre })
                var success = 0;
                console.log(data)
                data['FaceMatches'].forEach(async (element) => {
                    faceIdArray.push(element['Face'].ExternalImageId)
                })

                for (var key in faceIdArray) {
                    if (String(faceIdArray[key]) === String(user.dni)) {
                        success++;
                    }
                }
                if (success >= 2) {
                    return res.json({ msgError: false, data: { message: 'Entrowo' } })
                } else {
                    return res.json({ msgError: true, data: { message: 'PIN/NO SUCH USER' } })

                }
            }
        });

    }

}
const manager = new AWSManager()
var params = {
    CollectionId: 'dedicada' /* required */
};





router.get('/pollo/:id', async (req, res) => {
    console.log(req.params.id)
    fileContent = fs.readFileSync('testimage.png')
    var searchParams = {
        CollectionId: 'dedicada',
        FaceMatchThreshold: 95,
        Image: {
            Bytes: Buffer.from(fileContent)
        },
        MaxFaces: 5
    }
    manager.searchByImage(searchParams, req.params.id, res)
})

module.exports = router