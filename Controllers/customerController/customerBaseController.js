/**
 * Created by krishan on 27/05/17.
 */


var Config = require('../../Config');
var Service = require('../../Services');
var UniversalFunctions = require('../../Utils/UniversalFunctions');
var async = require('async');
var UploadManager = require('../../Lib/uploadManager');
var TokenManager = require('../../Lib/TokenManager');
var NotificationManager = require('../../Lib/NotificationManager');
var CodeGenerator = require('../../Lib/CodeGenerator');
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require('underscore');
var md5 = require('md5');

var register = function (payload, callback) {
    var response = {};
    var accessToken;
    var emailVerificationToken;
    async.auto({
        passwordCrypt : function (cb) {
            UniversalFunctions.cryptPassword(payload.password,function (err,data) {
                payload.password = data;
                cb();
            });
        },
        saveCustomer : ['passwordCrypt', function (cb) {
            emailVerificationToken = md5(Math.floor(Math.random() * 111111111) + 999999999);
            payload["emailVerificationToken"] = emailVerificationToken;
            payload.email = payload.email.toLowerCase();
            payload.isActive = true;
            Service.CustomerService.createCustomer(payload,function (err,savedData) {
                console.log(err,savedData);
                if(err && err.toString().indexOf("email_1") > -1 && err.toString().indexOf("duplicate") > -1){
                    cb(ERROR.EMAIL_ALREADY_EXIST);
                }
                else {
                    response = savedData.toObject();
                    cb();
                }
            });
        }],
        accessToken : ['saveCustomer', function (cb) {
            if (response._id) {
                var tokenData = { // used to generate access token and store in DB.
                    id: response._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                    deviceType: payload.deviceType
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken) {
                            console.log("at:",output.accessToken);
                            accessToken = output && output.accessToken;
                            cb();
                        } else {
                            cb(ERROR.IMP_ERROR);
                        }
                    }
                });
            } else {
                cb(ERROR.IMP_ERROR);
            }
        }],
        sendVerificationMail : ['saveCustomer', function (cb) {
            var variables = {
                name : payload.name,
                verificationLink : Config.APP_CONSTANTS.SERVER.WEBSITE_LINK + "?u=" + response._id + "&t=" + emailVerificationToken
            };
            NotificationManager.sendEmail("EMAIL_VERIFICATION",variables,payload.email);
            cb();
        }]
    },function (err,data) {
        response.password = undefined;
        response.__v = undefined;
        response.updatedAt = undefined;
        response["accessToken"] = accessToken;
        callback(err,response);
    });
};

var login = function (payload, callback) {
    var customerDetails;
    var successLogin = false; //To check if credentials are valid or not.
    var accessToken;
    async.auto({
        matchEmailMobile : function (cb) {
            var criteria = { // criteria to match either username or email.
                email : payload.email.toLowerCase()
            };
            var option = {
                lean: true
            };
            Service.CustomerService.getOnlyCustomer(criteria, {accessTokens:0}, option, function (err, result) {
                console.log(result);
                if (err) {
                    cb(err);
                }
                else if(result){
                    customerDetails = result;
                    if(customerDetails && !customerDetails.isActive){ //check whether this admin's account has been blocked or not.
                        cb("Your account has been suspended.");
                    }
                    else{
                        cb();
                    }
                }
                else {
                    cb(ERROR.INVALID_CREDENTIALS);
                }
            });
        },
        matchPassword : ['matchEmailMobile',function (cb) {
            UniversalFunctions.decryptPassword(payload.password,customerDetails.password,function (err,data) {
                if(err){
                    cb(err);
                }
                else if (!data) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
                }
                else {
                    successLogin = true;
                    cb();
                }
            });
        }],
        accessToken : ['matchPassword',function (cb) {
            var tokenData = { // used to generate access token and store in DB.
                id: customerDetails._id,
                type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                deviceType : payload.deviceType
            };
            TokenManager.setToken(tokenData, function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    if (output && output.accessToken) {
                        customerDetails["accessToken"] = output.accessToken;
                        cb();
                    } else {
                        cb(ERROR.IMP_ERROR)
                    }
                }
            });
        }]
    },function (err,data) {
        if(err){
            callback(err);
        }
        else{
            customerDetails.password = undefined;
            customerDetails.__v = undefined;
            customerDetails.emailVerificationToken?customerDetails.emailVerificationToken = undefined:null;
            callback(null,customerDetails);
        }
    });
};

var verifyEmail = function (payload, callback) {
    var userDetails = {};
    async.series([
        function (cb) {
            var criteria = {
                _id : payload.id,
                emailVerificationToken : payload.token
            };
            Service.CustomerService.getOnlyCustomer(criteria,{name:1,emailVerificationToken:1},{lean:true},function (err,user) {
                if(err){
                    cb(err);
                }
                else if(user){
                    userDetails = user;
                    cb();
                }
                else{
                    cb(ERROR.LINK_EXPIRED);
                }
            });
        },
        function (cb) {
            var criteria = {
                _id : payload.id,
                emailVerificationToken : payload.token
            };
            var setQuery = {
                $unset : {
                    emailVerificationToken : ""
                }
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        }
    ],function (err,data) {
        if(err){
            callback(err);
        }
        else{
            callback(null,{
                name: userDetails.name
            });
        }
    });
};

var updateMobile = function (userData, payload, callback) {
    var otp;
    async.auto({
        checkIfUnique : function (cb) {
            var criteria = {
                phoneNumber : payload.phoneNumber,
                countryCode : payload.countryCode,
                _id : {$ne : userData._id}
            };
            Service.CustomerService.getOnlyCustomer(criteria,{_id:1},{lean:true},function (err,user) {
                if(err){
                    cb(err);
                }
                else if(user){
                    cb(ERROR.PHONE_NO_EXIST);
                }
                else{
                    cb();
                }
            });
        },
        updateMobile : ['checkIfUnique',function (cb) {
            otp = Math.floor(Math.random() * 9999) + 1111;
            var criteria = {
                _id : userData._id
            };
            var setQuery = {
                phoneNumber : payload.phoneNumber,
                countryCode : payload.countryCode,
                phoneVerificationCode : otp
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        }],
        sendOTP : ['updateMobile',function (cb) {
            //send OTP to mobile
            cb();
        }]
    },function(err,data){
        if(err){
            callback(err);
        }
        else{
            callback();
        }
    });
};


var verifyMobile = function (userData, payload, callback) {
    var userDetails = {};
    async.series([
        function (cb) {
            var criteria = {
                _id : payload.id,
                phoneVerificationCode : payload.otpCode
            };
            Service.CustomerService.getOnlyCustomer(criteria,{_id:1},{lean:true},function (err,user) {
                if(err){
                    cb(err);
                }
                else if(user){
                    userDetails = user;
                    cb();
                }
                else{
                    cb(ERROR.OTP_CODE_NOT_FOUND);
                }
            });
        },
        function (cb) {
            var criteria = {
                _id : payload.id,
                phoneVerificationCode : payload.otpCode
            };
            var setQuery = {
                $unset : {
                    phoneVerificationCode : ""
                }
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        }
    ],function (err,data) {
        if(err){
            callback(err);
        }
        else{
            callback();
        }
    });
};

var resendPhoneOtp = function (userData, callback) {
    var otp;
    async.auto({
        updateOTP : function (cb) {
            otp = Math.floor(Math.random() * 9999) + 1111;
            var criteria = {
                _id : userData._id
            };
            var setQuery = {
                phoneVerificationCode : otp
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        },
        sendOTP : ['updateMobile',function (cb) {
            //send OTP to mobile
            cb();
        }]
    },function(err,data){
        if(err){
            callback(err);
        }
        else{
            callback();
        }
    });
};

var resendEmailVerificationEmail = function (userData, callback) {
    var emailVerificationToken;
    async.series([
        function (cb) {
            emailVerificationToken = md5(Math.floor(Math.random() * 111111111) + 999999999);
            var criteria = {
                _id : userData._id
            };
            var setQuery = {
                emailVerificationToken : emailVerificationToken
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        },
        function (cb) {
            var variables = {
                name : userData.name,
                verificationLink : Config.APP_CONSTANTS.SERVER.WEBSITE_LINK + "?u=" + userData._id + "&t=" + emailVerificationToken
            };
            NotificationManager.sendEmail("EMAIL_VERIFICATION",variables,userData.email);
            cb();
        }
    ],callback);
};

var forgotPassword = function (payload, callback) {
    var criteria;
    var userDetails;
    var otp;
    async.auto({
        checkPayload : function (cb) {
            if(payload.email){
                criteria = {
                    email : payload.email
                };
                cb();
            }
            else if(payload.countryCode && payload.phoneNumber){
                criteria = {
                    countryCode : payload.countryCode,
                    phoneNumber : payload.phoneNumber
                };
                cb();
            }
            else{
                cb();
            }
        },
        checkIfUserExists : ['checkPayload',function (cb) {
            Service.CustomerService.getOnlyCustomer(criteria,{_id:1, name:1, email:1},{lean:true},function(err, user){
                if(err){
                    cb(err);
                }
                else if(user){
                    userDetails = user;
                    cb();
                }
                else{
                    cb(ERROR.INVALID_PARAMS);
                }
            });
        }],
        updateOTP : ['checkIfUserExists',function (cb) {
            otp = Math.floor(Math.random() * 9999) + 1111;
            var updateCriteria = {
                _id: userDetails._id
            };
            var setQuery = {
                forgotPasswordCode : otp
            };
            Service.CustomerService.updateCustomer(updateCriteria,setQuery,{},cb);
        }],
        sendNotifications : ['updateOTP',function (cb) {
            var variables = {
                name : userDetails.name,
                forgotPasswordCode : otp
            };
            NotificationManager.sendEmail("FORGOT_PASSWORD",variables,userDetails.email);
            //sendMobileNotification
            cb();
        }]
    },function (err,data) {
        if(err){
            callback(err);
        }
        else{
            callback(null,{userId : userDetails._id});
        }
    });
};

var resetPassword = function (payload, callback) {
    var userDetails = {};
    async.series([
        function (cb) {
            var criteria = {
                _id : payload.id,
                forgotPasswordCode : payload.forgotPasswordCode
            };
            Service.CustomerService.getOnlyCustomer(criteria,{name:1},{lean:true},function (err,user) {
                if(err){
                    cb(err);
                }
                else if(user){
                    userDetails = user;
                    cb();
                }
                else{
                    cb(ERROR.LINK_EXPIRED);
                }
            });
        },
        function (cb) {
            var criteria = {
                _id : payload.id
            };
            var setQuery = {
                $unset : {
                    forgotPasswordCode : ""
                }
            };
            Service.CustomerService.updateCustomer(criteria,setQuery,{},cb);
        }
    ],function (err,data) {
        if(err){
            callback(err);
        }
        else{
            callback();
        }
    });
};

module.exports = {
    register : register,
    login : login,
    verifyEmail : verifyEmail,
    updateMobile : updateMobile,
    verifyMobile : verifyMobile,
    resendPhoneOtp : resendPhoneOtp,
    resendEmailVerificationEmail : resendEmailVerificationEmail,
    forgotPassword : forgotPassword,
    resetPassword : resetPassword
};
