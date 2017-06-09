'use strict';

var apns = require('apn');
var Path = require('path');
var Service = require('../Services');
var Config = require('../Config');
var nodemailer = require('nodemailer');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var util = require('util');
var poolConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: Config.APP_CONSTANTS.SERVER.EMAIL,
        pass: Config.APP_CONSTANTS.SERVER.PASSWORD
    }
};

var transporter = nodemailer.createTransport(poolConfig);
var handlebars = require('handlebars');
var ERROR = Config.APP_CONSTANTS.STATUS_MSG.ERROR;
var async = require('async');
var fcm = require('fcm-push');

var production = false;

function sendEmail(templateName, varToReplace , email) {
    var template = Config.APP_CONSTANTS.notificationMessages[templateName].body;
    var handlebarTemplate = handlebars.compile(template);
    var result = handlebarTemplate(varToReplace);
    var mailOptions = {
        from: Config.APP_CONSTANTS.SERVER.EMAIL, // sender address
        to: email,
        subject: Config.APP_CONSTANTS.notificationMessages[templateName].subject, // Subject line
        html: result // html body
    };
    // send mail with defined transport object
    console.log("mailOptions : ",mailOptions);
    transporter.sendMail(mailOptions, function(error, info){
        console.log("Error : ",error);
        console.log('Message sent: ' + info.response);
    });
}

function sendAndroidPush(deviceTokens,messageObj , callback){

    var sender = null;
    sender = new fcm(Config.pushConfig.androidPushSettings.user.fcmSender);
    if(deviceTokens && deviceTokens.length>0){
        var message = {
            registration_ids: deviceTokens,
            "priority" : "high",
            data: messageObj
        };
        console.log(message);
        sender.send(message, function (err, result) {
            console.log("ANDROID NOTIFICATION RESULT: " + result);
            console.log("ANDROID NOTIFICATION ERROR: " + err);
            callback(null,{response:"success"});
        });
    }
    else{
        console.log("No Device Token ");
        callback();
    }
}


function sendIosPushNotification(iosDeviceToken, payload , silent, callback) {
    var timeToLive;
    var iosApnCertificate;
    timeToLive = Math.floor(Date.now() / 1000) + 3600;
    iosApnCertificate = Config.pushConfig.iOSPushSettings.user.iosApnCertificate;

    var certificate = null;
    var push_success = true;
    certificate = Path.resolve(".") + iosApnCertificate;
    console.log(">>>",iosDeviceToken,certificate);

    var status = 1;
    var snd = 'ping.aiff';
    var options = {
        cert: certificate,
        certData: null,
        key: certificate,
        keyData: null,
        passphrase: '',
        ca: null,
        pfx: null,
        pfxData: null,
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true,
        debug : true,
        production : production,
        errorCallback: apnErrorCallback
    };

    function log(type) {
        return function () {
            console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    function apnErrorCallback(errorCode, notification, recipient) {
        console.log("apnErrorCallback");
        console.log("Error Code: " + errorCode);
        console.log("Notification: " + notification);
        push_success = false;
    }

    if (iosDeviceToken && iosDeviceToken.length > 0){
        try {
            var apnsConnection = new apns.Connection(options);
            var note = new apns.Notification();

            note.expiry = timeToLive ;
            note.contentAvailable = silent?1:0;
            note.sound = "";

            note.newsstandAvailable = status;
            note.payload = {
                notificationData : payload,
                notificationSound : snd
            };
            note.alert = "";
            apnsConnection.pushNotification(note, iosDeviceToken);
            // Handle these events to confirm that the notification gets
            // transmitted to the APN server or find error if any
            apnsConnection.on('error', log('error'));
            apnsConnection.on('transmitted', log('transmitted'));
            apnsConnection.on('timeout', log('timeout'));
            apnsConnection.on('connected', log('connected'));
            apnsConnection.on('disconnected', log('disconnected'));
            apnsConnection.on('socketError', log('socketError'));
            apnsConnection.on('transmissionError', log('transmissionError'));
            apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
            callback();
        }catch(e){
            console.trace('exception occured',e);
            callback();
        }
    }
}

module.exports  = {
    sendEmail : sendEmail,
    sendMultipleAndroidPush : sendAndroidPush,
    sendIosPushNotification : sendIosPushNotification
};