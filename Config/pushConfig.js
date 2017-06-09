/**
 * Created by krishan on 21/10/15.
 */

'use strict';

var androidPushSettings = {
    user: {
        brandName: "nodeSeed",
        fcmSender: 'yourFCMToken'
    }
};
var iOSPushSettings = {
    user: {
        iosApnCertificate: "/Certs/DEV_Push.pem",
        gateway: "gateway.sandbox.push.apple.com"
    }
};


module.exports = {
    androidPushSettings: androidPushSettings,
    iOSPushSettings: iOSPushSettings
};
