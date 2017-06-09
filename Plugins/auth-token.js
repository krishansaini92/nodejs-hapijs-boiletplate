'use strict';
/**
 * Created by Krishan
 */

var TokenManager = require('../Lib/TokenManager');
var UniversalFunc = require('../Utils/UniversalFunctions');

exports.register = function(server, options, next){

//Register Authorization Plugin
    server.register(require('hapi-auth-bearer-token'), function (err) {
        //Create Auth strategies for multiple users by copying the below code and doing the appropriate changes.
        server.auth.strategy('UserAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                TokenManager.verifyToken(token, function (err,response) {
                    if (err || !response || !response.userData){
                        callback(null, false, {token: token, userData: null})
                    }else {
                        callback(null, true, {token: token, userData: response.userData})
                    }
                });

            }
        });

    });

    next();
};

exports.register.attributes = {
    name: 'auth-token-plugin'
};