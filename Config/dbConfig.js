/**
 * Created by Krishan
 */

 'use strict';

/*Please change the following credentials*/

var mongo = {
    URI: process.env.MONGO_URI || 'mongodb://localhost/nodeSeed',
    //URI: process.env.MONGO_URI || "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@localhost/"+process.env.MONGO_DBNAME_DEV,
    port: 27017
};

module.exports = {
    mongo: mongo
};



