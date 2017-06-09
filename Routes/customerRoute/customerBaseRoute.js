var UniversalFunctions = require('../../Utils/UniversalFunctions');
var Controller = require('../../Controllers');
var Joi = require('joi');
var Config = require('../../Config');

var customerRegister = {
    method: 'POST',
    path: '/api/customer/register',
    handler: function (request, reply) {
        var payloadData = request.payload;
        Controller.CustomerBaseController.register(payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
            }
        });
    },
    config: {
        description: 'Register a new customer',
        tags: ['api', 'user'],
        validate: {
            payload: {
                name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
                email: Joi.string().email().required(),
                password: Joi.string().optional().min(5).allow(''),
                facebookId: Joi.string().optional().trim().allow(''),
                deviceType: Joi.string().required().valid([Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.WEB,Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().allow('').optional().trim()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};


var customerLogin = {
    method: 'POST',
    path: '/api/customer/login',
    handler: function (request, reply) {
        var payloadData = request.payload;
        Controller.CustomerBaseController.login(payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
            }
        });
    },
    config: {
        description: 'Register a new customer',
        tags: ['api', 'user'],
        validate: {
            payload: {
                email: Joi.string().email().required(),
                password: Joi.string().optional().min(5).allow(''),
                deviceType: Joi.string().required().valid([Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.WEB,Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID])
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};


var verifyEmail = {
    method: 'POST',
    path: '/api/customer/verifyEmail',
    handler: function (request, reply) {
        var payloadData = request.payload;
        Controller.CustomerBaseController.verifyEmail(payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.EMAIL_VERIFIED, data))
            }
        });
    },
    config: {
        description: 'Verify Email Address',
        tags: ['api', 'user'],
        validate: {
            payload: {
                id: Joi.string().length(24).required(),
                token: Joi.string().length(32).required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var updateMobile =
    {
        method: 'PUT',
        path: '/api/customer/updateMobile',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CustomerBaseController.updateMobile(userData, request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            auth: 'CustomerAuth',
            validate: {
                payload : {
                    phoneNumber : Joi.string().required(),
                    countryCode : Joi.string().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'Update Phone Number of customer',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };

var verifyMobile =
    {
        method: 'PUT',
        path: '/api/customer/verifyMobile',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CustomerBaseController.verifyMobile(userData, request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            auth: 'CustomerAuth',
            validate: {
                payload : {
                    id : Joi.string().length(24).required(),
                    otpCode : Joi.string().length(4).required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'Verify Phone Number using OTP Code',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };

var resendPhoneOtp =
    {
        method: 'GET',
        path: '/api/customer/resendPhoneOtp',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CustomerBaseController.resendPhoneOtp(userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            auth: 'CustomerAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'GET Phone verification OTP Code',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };

var resendEmailVerificationEmail =
    {
        method: 'GET',
        path: '/api/customer/resendEmailVerificationEmail',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CustomerBaseController.resendEmailVerificationEmail(userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            auth: 'CustomerAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'Get email verification Link',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };


var forgotPassword =
    {
        method: 'PUT',
        path: '/api/customer/forgotPassword',
        handler: function (request, reply) {
            Controller.CustomerBaseController.forgotPassword(request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            validate: {
                payload : {
                    email : Joi.string().email().required(),
                    countryCode : Joi.string().required(),
                    phoneNumber : Joi.string().required()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'get OTP Code to reset password',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };

var resetPassword =
    {
        method: 'PUT',
        path: '/api/customer/forgotPassword',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CustomerBaseController.forgotPassword(userData, request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            auth: 'CustomerAuth',
            validate: {
                payload : {
                    id : Joi.string().length(24).required(),
                    forgotPasswordCode : Joi.string().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'Reset Password using OTP Code',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    };

var CustomerBaseRoute =
    [
        customerRegister,
        customerLogin,
        verifyEmail,
        updateMobile,
        verifyMobile,
        resendPhoneOtp,
        resendEmailVerificationEmail,
        forgotPassword,
        resetPassword
    ];
module.exports = CustomerBaseRoute;