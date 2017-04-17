var Server = require( 'node-static' ).Server;
var https = require('https');
var fs = require('fs');

var homepageServer = null;

APP.initServer = function(){

    // ---------------
    // HOMEPAGE SERVER
    // ---------------
    // modules

    var filesServer = new Server( 'dist/', {
        cache: false,
        gzip: true
    } );

    var credentials = {
        key: fs.readFileSync('server/cert/key.pem'),
        cert: fs.readFileSync('server/cert/cert.pem')
    };
    // homepage Middleware
    homepageServer = https.createServer(credentials, function(req, res) {

        req.addListener( 'end', function () {
            filesServer.serve( req, res );
        } ).resume();
        return;

        if(req.url.indexOf('.html') != -1){
            fs.readFile('client/view/' + req.url, function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            });
        }
        else if(req.url.indexOf('client/view/css/index.css') != -1){
            fs.readFile('client/view/css/index.css', function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.write(data);
                res.end();
            });
        }
        else if(req.url.indexOf('client.js') != -1){
            fs.readFile('build/client.js', function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                res.write(data);
                res.end();
            });
        }else if(req.url.indexOf('jquery.min.js') != -1){
            fs.readFile('bower_components/jquery/dist/jquery.min.js', function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                res.write(data);
                res.end();
            });
        }else if(req.url.indexOf('jquery-ui.min.js') != -1){
            fs.readFile('bower_components/jquery-ui/jquery-ui.min.js', function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                res.write(data);
                res.end();
            });
        }else if(req.url.indexOf('annyang.js') != -1){
            fs.readFile('bower_components/annyang/annyang.js', function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                res.write(data);
                res.end();
            });
        }else if(req.url.indexOf('.png') != -1){
            fs.readFile('client/assets/' + req.url.split('assets/')[1], function (err, data) {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'image'});
                res.write(data);
                res.end();
            });
        }else{

        }
    });

    homepageServer.listen(9000, function () {
        console.log('homepage server started');
    });


};

APP.initModules = function(){

    // init modules
    var baseModule = new APP.BaseModule();
    var musicModule = new APP.MusicModule();
    var temperatureModule = new APP.TemperatureModule();

    baseModule.init(homepageServer);
    musicModule.init();
    temperatureModule.init(baseModule);

};

APP.initServer();
APP.initModules();
