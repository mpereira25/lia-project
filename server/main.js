var Server = require( 'node-static' ).Server;
var https = require('https');
var fs = require('fs');

var homepageServer = null;
var commandsServer = null;
var keyAuth = 'te8efghtju884e7d4e5g4gr6468at4gr8h48k8gr48';

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
    //  Middleware
    commandsServer = https.createServer(credentials, function(req, res) {
        if(req.url.indexOf('?enterHome=') != -1){
            var param = req.url.split('?enterHome=')[1];
            var command = new APP.EnterHomeCmd(this);
            command.execute(function(){}, param);
        }else if(req.url.indexOf('?leaveHome=') != -1){
            var param = req.url.split('?leaveHome=')[1];
            var command = new APP.LeaveHomeCmd(this);
            command.execute(function(){}, param);
        }else if(req.url.indexOf('key=') !== -1 &&
                    req.url.indexOf('idcmd=') !== -1){

            var params = req.url.split('?')[1];
            var paramsTab = params.split('&');
            var nb = paramsTab.length;
            var paramsObj = {};
            var paramPair;
            var i;
            for(i = 0; i < nb ; i++){
                paramPair = paramsTab[i].split('=');
                paramsObj[paramPair[0]] = paramPair[1];
            }

            if(paramsObj.key === keyAuth){
                var idCmd = paramsObj.idcmd;
                var words = [];
                if(paramsObj.words){
                    words = paramsObj.words.split(',');
                }
                console.log("CMD to exec :");
                console.log(paramsObj);

                // search command with id = idCmd in CommandsModel
                nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
                var cmd = null;
                for (i = 0; i < nb; i++) {
                    if(APP.models.CommandsModel.LISTENING_WORDS_ACTION[i].id === idCmd){
                        console.log("CMD found !");
                        cmd = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
                        switch(cmd.type){
                            case 'execute':
                                APP.services.DispatcherCommands.run(words, cmd, APP.lastServiceLaunch).then(function(){
                                    APP.lastServiceLaunch = APP.services.DispatcherCommands.lastServiceLaunch;
                                    console.log('lastServiceLaunch : ' + lastServiceLaunch);
                                }).catch(function(){

                                });
                                break;
                        }
                        break;
                    }
                }
            }

        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('');
        res.end();
    });

    //  Middleware
    homepageServer = https.createServer(credentials, function(req, res) {

        req.addListener( 'end', function () {
            filesServer.serve( req, res, function (e, result) {
                if (e) { // There was an error serving the file
                    if(req.url.indexOf("config.json") !== -1) {
                        filesServer.serveFile('../datas/config.json', 200, {}, req, res);
                    }else{
                        // Respond to the client
                        res.writeHead(e.status, e.headers);
                        res.end();
                    }
                }
            });
        } ).resume();

    });

    homepageServer.listen(9000, function () {
        console.log('homepage server started');
    });

    commandsServer.listen(9001, function () {
        console.log('commandsServer started');
    });

};

APP.initModules = function(){
    // domains
    APP.services = {};
    APP.models = {};
    APP.modules = {};

    APP.configJSON = JSON.parse(fs.readFileSync('datas/config.json', 'utf8'));
    APP.commandsJSON = JSON.parse(fs.readFileSync('datas/commands.json', 'utf8'));

    //console.log(APP.configJSON);


    // init modules
    APP.modules.BaseModule = new APP.BaseModule();
    APP.modules.RobotModule = new APP.RobotModule();
    APP.modules.MusicModule = new APP.MusicModule();
    APP.modules.TemperatureModule = new APP.TemperatureModule();
    APP.modules.YoutubeModule = new APP.YoutubeModule();
    APP.modules.SearchModule = new APP.SearchModule();
    APP.modules.SoundcloudModule = new APP.SoundcloudModule();

    APP.modules.BaseModule.init(homepageServer);
    APP.modules.RobotModule.init();
    APP.modules.MusicModule.init();
    APP.modules.TemperatureModule.init();
    APP.modules.YoutubeModule.init();
    APP.modules.SearchModule.init();
    APP.modules.SoundcloudModule.init();
};

APP.initServer();
APP.initModules();
