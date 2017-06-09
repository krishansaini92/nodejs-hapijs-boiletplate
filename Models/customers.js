/**
 * Created by Krishan on 15/11/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var accessToken = new Schema({
    deviceType: {type: String, enum: [Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.WEB,Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true}
});

var customer = new Schema({
    name: {type: String, trim: true, required: true},
    email: {type:String, required:true, unique:true},
    accessTokens: [accessToken],
    facebookId:{type: String, trim: true},
    phoneNumber: {type: String, trim: true, index: true, min: 5, max: 15},
    emailVerificationToken : {type:String},
    phoneVerificationCode : {type: String},
    forgotPasswordCode : {type: String},
    password: {type: String},
    countryCode: {type: String},
    phoneVerified: {type: Boolean, default: false},
    deviceToken: {type: String},
    registrationDate: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, required: true},
    isActive : {type:Boolean, default:true}
}, { autoIndex: true });

customer.on('index', function(err) {
    if (err) {
        console.error('customer index error: %s', err);
    } else {
        console.info('customer indexing complete');
    }
});
module.exports = mongoose.model('customers', customer);