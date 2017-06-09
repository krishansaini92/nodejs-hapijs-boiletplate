/**
 * Created by Krishan on 15/11/16.
 */
'use strict';

var Models = require('../Models');


var updateCustomer = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.Customers.findOneAndUpdate(criteria, dataToSet, options, callback);
};
//Insert Customer in DB
var createCustomer = function (objToSave, callback) {
    new Models.Customers(objToSave).save(callback)
};
//Delete Customer in DB
var deleteCustomer = function (criteria, callback) {
    Models.Customers.findOneAndRemove(criteria, callback);
};

//Get Customers from DB
var getCustomer = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.Customers.find(criteria, projection, options, callback);
};


//Get Customers from DB
var getOnlyCustomer = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.Customers.findOne(criteria, projection, options, callback);
};

var getAllGeneratedCodes = function (callback) {
    var criteria = {
        OTPCode : {$ne : null}
    };
    var projection = {
        OTPCode : 1
    };
    var options = {
        lean : true
    };
    Models.Customers.find(criteria,projection,options, function (err, dataAry) {
        if (err){
            callback(err)
        }else {
            var generatedCodes = [];
            if (dataAry && dataAry.length > 0){
                dataAry.forEach(function (obj) {
                    generatedCodes.push(obj.OTPCode.toString())
                });
            }
            callback(null,generatedCodes);
        }
    })
};

module.exports = {
    updateCustomer: updateCustomer,
    createCustomer: createCustomer,
    deleteCustomer: deleteCustomer,
    getOnlyCustomer : getOnlyCustomer,
    getCustomer:getCustomer,
    getAllGeneratedCodes:getAllGeneratedCodes
};