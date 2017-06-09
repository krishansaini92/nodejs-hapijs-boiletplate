/**
 * Created by Krishan
 */

'use strict';
var Mongoose = require('mongoose');
var Config = require('../Config');



//Connect to MongoDB
Mongoose.connect(Config.dbConfig.mongo.URI, function (err) {
    if (err) {
        console.log("DB Error: ", err);
        process.exit(1);
    } else {
        console.log('MongoDB Connected');
    }
});

exports.Mongoose = Mongoose;


