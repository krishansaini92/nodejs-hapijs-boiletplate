/**
 * Created by Krishan
 */

'use strict';
//External Dependencies
var Hapi = require('hapi');

//Internal Dependencies
var Config = require('./Config');
var Routes = require('./Routes');
var Plugins = require('./Plugins');
var MongoConnect = require('./Utils/mongoConnect');
var Service = require('./Services');

//Create Server
var server = new Hapi.Server({
    app: {
        name: Config.APP_CONSTANTS.SERVER.appName
    }
});

server.connection({
    port: Config.APP_CONSTANTS.SERVER.PORTS.HAPI,
    routes: {cors: true}
});

//Register All Plugins
server.register(Plugins, function (err) {
if (err){
    server.error('Error while loading plugins : ' + err)
}else {
    server.log('info','Plugins Loaded')
}
});

//Default Routes
server.route(
    {
        method: 'GET',
        path: '/',
        handler: function (req, res) {
            res.view('welcome')
        }
    }
);

//API Routes
server.route(Routes);

//Adding Views
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './Views'
});


server.on('response', function (request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
    console.log('Request payload:', request.payload);
});

server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});

