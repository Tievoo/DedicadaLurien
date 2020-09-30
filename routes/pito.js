const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const fs = require('fs')
const axios = require('axios')
var fileContent;
var url = 'http://localhost:8080';
const UserNew = require('../models/User');
const { unzipSync } = require('zlib');
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

    searchByImage = async (parametros, pin, res) => {
        var faceIdArray = []
        rekognition.searchFacesByImage(parametros, async (err, data) => {
            if (err) {
                console.log(err, err.stack);
                return res.json(this.createErrMsg(true, 'AWS ERROR (No face in camera?)'))

            }  // an error occurred
            else {
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
                        var hora = `${date.getHours()}:${date.getMinutes()}`
                        axios.post(`${url}/api/debug/companyid`, {
                            name:user.username,
                            hour:hora,
                            companyid:user.companyID
                        })
                        return res.json(this.createErrMsg(false, ('Entró ' + user.username)))

                    } else {
                        if (faceIdArray.length >= 2) {
                            let dniUnk = this.findDuplicates(faceIdArray)
                            if (dniUnk != null) {
                                const newUser = await UserNew.findOne({ dni: dniUnk })
                                return res.json(this.createErrMsg(true, ('Se reconoció la cara de ' + newUser.username + ', pero el QR de ' + user.username)))

                            } else return res.json(this.createErrMsg(true, 'Error inesperado.'))

                        } else return res.json(this.createErrMsg(true, 'No se reconoce la cara. Reentrena tu modelo.'))
                    }
                } else return res.json(this.createErrMsg(true, 'No existe usuario con ese QR'))

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
        CollectionId: '1a2b3c',
        FaceMatchThreshold: 95,
        Image: {
            Bytes: Buffer.from(fileContent)
        },
        MaxFaces: 5
    }
    manager.searchByImage(searchParams, req.params.id, res)
})

module.exports = router