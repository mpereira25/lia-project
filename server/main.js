var Server = require( 'node-static' ).Server;
var https = require('https');
var fs = require('fs');

var socketServer = null;
var clientServer = null;

APP.configJSON = JSON.parse(fs.readFileSync('datas/config.json', 'utf8'));
APP.commandsJSON = JSON.parse(fs.readFileSync('datas/commands.json', 'utf8'));
var keyAuth = APP.configJSON.auth.secret;

APP.initServer = function(){

    // ---------------
    // HOMEPAGE SERVER
    // ---------------
    // modules

    var filesRobotServer = new Server( 'dist/', {
        cache: false,
        gzip: true
    } );

    var filesInterfaceServer = new Server( 'clientInterface/dist/', {
        cache: false,
        gzip: true
    } );

    var credentials = {
        key: fs.readFileSync('server/cert/key.pem'),
        cert: fs.readFileSync('server/cert/cert.pem')
    };
    //  Middleware
    clientServer = https.createServer(credentials, function(req, res) {

        var command = null;
        var paramsObj = getParamFromUrl(req.url);
        var isLocal = req.headers.host.indexOf('192.168') === 0;
        var secretValid = paramsObj.key && paramsObj.key === keyAuth;

        console.log('isLocal ' + isLocal);
        console.log('clientServer get url ' + req.url);

        if(paramsObj.enterHome) {

            command = new APP.EnterHomeCmd(this);
            command.execute(function(){}, paramsObj.enterHome);

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('');
            res.end();

        }else if(paramsObj.leaveHome) {

            command = new APP.LeaveHomeCmd(this);
            command.execute(function(){}, paramsObj.leaveHome);

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('');
            res.end();

        }else if(paramsObj.key && (isLocal || secretValid)) {

            if(paramsObj.idcmd) {
                var idCmd = paramsObj.idcmd;
                var words = [];
                if(paramsObj.words){
                    words = paramsObj.words.split(',');
                }
                console.log("CMD to exec :");
                console.log(paramsObj);

                // search command with id = idCmd in CommandsModel
                nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
                for (i = 0; i < nb; i++) {
                    if(APP.models.CommandsModel.LISTENING_WORDS_ACTION[i].id === idCmd){
                        console.log("CMD found !");
                        command = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
                        switch(command.type){
                            case 'execute':
                                APP.services.DispatcherCommands.run(words, command, APP.lastServiceLaunch).then(function(){
                                    APP.lastServiceLaunch = APP.services.DispatcherCommands.lastServiceLaunch;
                                    console.log('lastServiceLaunch : ' + lastServiceLaunch);
                                }).catch(function(){

                                });
                                break;
                        }
                        break;
                    }
                }
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('');
                res.end();

            }else if(req.url.indexOf("config.json") !== -1) {

                filesInterfaceServer.serveFile('../../datas/config.json', 200, {}, req, res);

            }else if(req.url.indexOf("commands.json") !== -1) {

                filesInterfaceServer.serveFile('../../datas/commands.json', 200, {}, req, res);

            }else {

                filesInterfaceServer.serveFile('index.html', 200, {}, req, res);

            }
        }else if(req.url.indexOf("index.html") === -1 && req.url.substr(0, 2).indexOf("/?") === -1 && req.url !== '/') {
            req.addListener( 'end', function () {
                filesInterfaceServer.serve( req, res, function (e, result) {
                    if (e) { // There was an error serving the file
                        displayErrorPage(filesRobotServer, req, res);
                    }
                });
            } ).resume();
        }else {
            displayErrorPage(filesRobotServer, req, res);
        }

    });

    //  Middleware
    socketServer = https.createServer(credentials, function(req, res) {

        req.addListener( 'end', function () {
            filesRobotServer.serve( req, res, function (e, result) {
                if (e) { // There was an error serving the file

                    if(req.url.indexOf("config.json") !== -1) {
                        filesRobotServer.serveFile('../datas/config.json', 200, {}, req, res);
                    }else {
                        displayErrorPage(filesRobotServer, req, res);
                    }
                }
            });
        } ).resume();

    });

    socketServer.listen(9000, function () {
        console.log('socketServer on port 9000 started');
    });

    clientServer.listen(9001, function () {
        console.log('clientServer on port 9001 started');
    });

};

function displayErrorPage(filesServer, req, res) {
    filesServer.serveFile('../dist/404.html', 404, {}, req, res);
}

function getParamFromUrl(url) {
  var paramsObj = {};

  if(!url) {
    return {};
  }

  var params = url.split('?');
  if(params.length > 1) {
    var paramsTab = params[1].split('&');
    var nb = paramsTab.length;
    var paramsObj = {};
    var paramPair;
    var i;
    for(i = 0; i < nb ; i++){
        paramPair = paramsTab[i].split('=');
        paramsObj[decodeURI(paramPair[0])] = decodeURI(paramPair[1]);
    }
  }


  return paramsObj;
}

APP.initModules = function(){
    // domains
    APP.services = {};
    APP.models = {};
    APP.modules = {};

    //console.log(APP.configJSON);


    // init modules
    APP.modules.BaseModule = new APP.BaseModule();
    APP.modules.RobotModule = new APP.RobotModule();
    APP.modules.MusicModule = new APP.MusicModule();
    APP.modules.TemperatureModule = new APP.TemperatureModule();
    APP.modules.YoutubeModule = new APP.YoutubeModule();
    APP.modules.SearchModule = new APP.SearchModule();
    APP.modules.SoundcloudModule = new APP.SoundcloudModule();

    APP.modules.BaseModule.init(socketServer);
    APP.modules.RobotModule.init();
    APP.modules.MusicModule.init();
    APP.modules.TemperatureModule.init();
    APP.modules.YoutubeModule.init();
    APP.modules.SearchModule.init();
    APP.modules.SoundcloudModule.init();
};

APP.initServer();
APP.initModules();
