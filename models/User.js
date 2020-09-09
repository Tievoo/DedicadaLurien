const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String //le saque una coma aca
    },
    role: {
        type: String,
        default: "user",
        enum: ['user', 'admin','mod'],
    },
    dni: {
        type: Number,
        unique: true
    },
    modeloEntrenado: {
        type: Boolean,
        default: false
    },
    companyID: {
        type: String,
    },
    mail: {
        type: String,
    },
    createdAccount: {
        type: Boolean,
        default: false
    },
    cantidadFotos: {
        type: Number,
        default: 0
    },
    faceIds:[String],
    qrPin:{
        type: String,
        maxlength: 30,
        minlength: 25
    }
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();
    bcrypt.hash(this.password, 10, (err, passwordHash) => {
        if (err)
            return next(err);
        this.password = passwordHash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err)
            return cb(err);
        else {
            if (!isMatch)
                return cb(null, isMatch);
            return cb(null, this);
        }
    });
}

module.exports = mongoose.model('UserNew', UserSchema);