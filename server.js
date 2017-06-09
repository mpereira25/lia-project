var APP = {};
/**
 * Created by stellar on 03/04/2016.
 */
APP.EVENT = (function(){


    return this;
})();
/**
 * Created by stellar on 03/04/2016.
 */
APP.SOCKET_MESSAGE = (function(){

    this.UP = 'UP';
    this.DOWN = 'DOWN';
    this.RIGHT = 'RIGHT';
    this.LEFT = 'LEFT';
    this.STOP = 'STOP';
    this.LEFTDOWN = 'LEFTDOWN';
    this.LEFTUP = 'LEFTUP';
    this.RIGHTDOWN = 'RIGHTDOWN';
    this.RIGHTUP = 'RIGHTUP';
    this.ANALOG = 'ANALOG';

    this.TALK = 'TALK';
    this.TALK_END = 'TALK_END';

    this.VOLTAGE_CHANGE = 'VOLTAGE_CHANGE';
    this.VOLTAGE_LOW = 'VOLTAGE_LOW';
    this.VOLTAGE_CRITICAL = 'VOLTAGE_CRITICAL';
    this.VOLTAGE_NORMAL = 'VOLTAGE_NORMAL';

    this.ROBOT_TURN_ARROUND = 'ROBOT_TURN_ARROUND';

    return this;
})();
var EventBus = require('eventbusjs');

APP.SocketController = function(server){

    this.ON_TALK = 'SocketController.ON_TALK';
    this.ON_TALK_END = 'SocketController.ON_TALK_END';
    this.ON_ANALOG_CHANGE = 'SocketController.ON_ANALOG_CHANGE';
    this.ON_PAD_CHANGE = 'SocketController.ON_PAD_CHANGE';
    this.ON_CLIENT_CONNECT = 'SocketController.ON_CLIENT_CONNECT';
    this.ON_ACTION = 'SocketController.ON_ACTION';

    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    this.socket;

    var _ref = this;
    var _socket;
    var io = require('socket.io').listen(server);

    // Quand un client se connecte, on le note dans la console
    io.sockets.on('connection', function (socket) {
        console.log('Socket Un client est connecté !');
        _socket = socket;
        _ref.socket = socket;

        if(APP.models.TalkModel.islistening){
            _ref.sendAction('listen_on', 'listen_on');
        }else{
            _ref.sendAction('listen_off', 'listen_off');
        }

        EventBus.dispatch(_ref.ON_CLIENT_CONNECT, _ref);
        //_ref.talk(APP.SOCKET_MESSAGE.TALK, "test du serveur");

        socket.on('talk', function (message) {
            //console.log('Socket receive : ' + message);

            var split = message.split('::');
            var type = split[0];

            switch(type){
                case APP.SOCKET_MESSAGE.TALK:
                    EventBus.dispatch(_ref.ON_TALK, _ref, split[1]);
                    break;
                case APP.SOCKET_MESSAGE.TALK_END:
                    EventBus.dispatch(_ref.ON_TALK_END, _ref, split[1]);
                    break;
            }
        });
        socket.on('motion', function (message) {
            //console.log('Socket receive : ' + message);

            var split = message.split('::');
            var type = split[0];

            switch(type){
                case APP.SOCKET_MESSAGE.UP:
                case APP.SOCKET_MESSAGE.DOWNnode :
                case APP.SOCKET_MESSAGE.RIGHT:
                case APP.SOCKET_MESSAGE.LEFT:
                case APP.SOCKET_MESSAGE.STOP:
                    EventBus.dispatch(_ref.ON_PAD_CHANGE, _ref, split[1]);
                    break;
                case APP.SOCKET_MESSAGE.ANALOG:
                    EventBus.dispatch(_ref.ON_ANALOG_CHANGE, _ref, split[1]);
                    break;
            }
        });
        socket.on('lia_action', function (message) {
            console.log('Socket receive : ' + message);

            var split = message.split('::');
            var type = split[0];

            if( split[1] == '') return;

            switch(type){
                case 'listen_switch':
                    APP.models.TalkModel.islistening = !APP.models.TalkModel.islistening;

                    if(APP.models.TalkModel.islistening){
                        APP.services.SnowboyService.stop();
                        _ref.sendAction('listen_on', 'listen_on');
                        APP.services.SoundEmotionService.playSound('hello');
                    }else{
                        _ref.sendAction('listen_off', 'listen_off');
                        APP.services.SoundEmotionService.playSound('sad');
                        setTimeout(function(){
                            APP.services.SnowboyService.start();
                        }, 1500);
                    }

                    break;
                case 'get_listen_state':
                    if(APP.models.TalkModel.islistening){
                        APP.services.SnowboyService.stop();
                        _ref.sendAction('listen_on', 'listen_on');
                    }else{
                        _ref.sendAction('listen_off', 'listen_off');
                        setTimeout(function(){
                            APP.services.SnowboyService.start();
                        }, 1500);
                    }

                    break;

                case 'halt':
                    //_ref.talkController.speech('Au revoir');
                    APP.services.SoundEmotionService.playSound('sad');
                    APP.services.DevicesService.halt();
                    break;

                case 'reboot':
                    _ref.talkController.speech('Reboot');
                    APP.services.DevicesService.reboot();
                    break;
            }

            EventBus.dispatch(_ref.ON_ACTION, _ref, type, split[1]);

        });
    });
    this.talk = function(type, data){
        _socket.emit('talk', type + "::" + data);
        _socket.broadcast.emit('talk', type + "::" + data);
    };
    this.sendInfos = function(type, data){
        _socket.emit('infos', type + "::" + data);
        _socket.broadcast.emit('infos', type + "::" + data);
    };
    this.sendAction = function(type, data){
        _socket.emit('lia_action', type + "::" + data);
        _socket.broadcast.emit('lia_action', type + "::" + data);
    };
    return this;
};
var RSVP = require('rsvp');
var EventBus = require('eventbusjs');

APP.DevicesService = (function(){

    var _ref = this;
    var _isInit = false;
    var _indexWav = 0;

    var _textToSpeechWav = null;
    var _resolveTextToSpeech = null;

    this.socketController = null;

    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    this.init = function(){

        _isInit = true;

        //linux
        var linuxCmd = 'amixer scontrols';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    }

    this.startClient = function(){

        var os = require('os');

        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }

        //linux
        var linuxCmd = 'chromium-browser "https://' + addresses[0] + ':' + APP.configJSON.hosts.socket.port + '"';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.closeClient = function(){
        //linus
        var linuxCmd = 'sudo killall chromium-browser';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    }

    this.restartClient = function(){
        _ref.closeClient();
        setTimeout(function(){
            _ref.startClient();
        }, 1500);
    }

    this.execute = function(cmds){
        return new RSVP.Promise(function(resolve, reject){
            if(cmds && cmds.length > 0){
              if(!_isInit) _ref.init();

              //linux
              var linuxCmd = cmds[0];

              var exec = require('child_process').exec;
              var child = exec(linuxCmd);
              child.stdout.on('data', function(data) {
                  console.log('stdout: ' + data);
              });
              child.stderr.on('data', function(data) {
                  console.log('stdout: ' + data);
              });
              child.on('close', function(code) {
                  console.log('closing code: ' + code);
              });

              resolve();
            }else{
              reject();
            }
        });
    };

    this.upVolume = function(){

        if(!_isInit) _ref.init();

        // windows
        var winCmd = 'nircmd.exe changesysvolume 2000';

        //linux
        var linuxCmd = 'amixer set PCM 10dB+';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };
    this.downVolume = function(){

        if(!_isInit) _ref.init();

        // windows
        var winCmd = 'nircmd.exe changesysvolume -2000';

        //linux
        var linuxCmd = 'amixer set PCM 10dB-';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.textToSpeech = function(text){

        return new RSVP.Promise(function(resolve, reject){

            reject();
            return;

            _indexWav++;
            _resolveTextToSpeech = resolve;

            var linuxCmd = 'pico2wave -l fr-FR -w pico2wave/rec' + _indexWav + '.wav "' + text + '"';

            var exec = require('child_process').exec;
            var child = exec(linuxCmd);

            child.stdout.on('data', function(data) {
                console.log('stdout: ' + data);

            });
            child.stderr.on('data', function(data) {
                console.log('stdout: ' + data);
                reject();
            });
            child.on('close', function(code) {
                console.log('closing code: ' + code);
                try{
                    var Sound = require('node-aplay');

                    _textToSpeechWav = new Sound('pico2wave/rec' + _indexWav + '.wav');
                    _textToSpeechWav.on('complete', function () {
                        var childRemove = exec('rm pico2wave/rec' + _indexWav + '.wav');
                        _resolveTextToSpeech = null;
                        _textToSpeechWav = null;
                        resolve();
                    });
                    _textToSpeechWav.play();
                }catch(e){
                    reject();
                }
            });

        });
    };

    this.stopTalk = function() {
        if(_resolveTextToSpeech){
            _textToSpeechWav.stop();
            _textToSpeechWav = null;
            var childRemove = exec('rm pico2wave/rec' + _indexWav + '.wav');
            _resolveTextToSpeech();
            _resolveTextToSpeech = null;
        }
    }

    this.halt = function(){
        if(!_isInit) _ref.init();

        //linux
        var linuxCmd = 'sudo halt';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.reboot = function(){
        if(!_isInit) _ref.init();

        //linux
        var linuxCmd = 'sudo reboot';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.getTime = function(){
        var date = new Date();
        return 'Il es ' + date.getHours() + ' heure ' + date.getMinutes();
    };

    this.getDate = function(){
        var day = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        var date = new Date();
        return 'Nous sommes le ' + date.toLocaleDateString();
    };

    this.cameraOn = function(){
        if(!_isInit) _ref.init();

        //linux
        var linuxCmd = 'sh /home/pi/webcam.sh';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.cameraOff = function(){
        if(!_isInit) _ref.init();

        //linux
        var linuxCmd = 'sh /home/pi/webcam_off.sh';

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };
    return this;

});
var fs = require('fs');
var wav = require('wav');
var record = require('node-record-lpcm16');
var Mic = require('node-microphone');

APP.SnowboyService = (function(){

    var isInit = false;
    var micStream;
    var Detector;
    var Models;
    var models;
    var mic;
    var detector;
    var _startTimeout = -1;

    var _ref = this;

    var timeoutStandBy = -1;
    this.countStandBy = 0;
    this.standByValue = APP.configJSON.hotword.sleepAfterSeconds;
    this.isStop = true;

    try{
        Detector = require('snowboy').Detector;
        Models = require('snowboy').Models;
        isInit = true;
        console.log('APP.SnowboyService is initialized');
    }catch(e){
        console.log('ERROR APP.SnowboyService');
        console.log(e);
        isInit = false;
    }

    if(isInit){
        models = new Models();

        models.add({
            file: APP.configJSON.hotword.file,
            sensitivity: APP.configJSON.hotword.sensitivity,
            hotwords : APP.configJSON.hotword.hotwords
        });


    }

    this.start = function(sound){

        if(!isInit) return;
        APP.models.TalkModel.islistening = false;
        APP.services.socketController.sendAction('listen_off', 'listen_off');

        clearTimeout(_startTimeout);
        _startTimeout = setTimeout(function(){
            _ref._start();
        }, 1500);
    }
    this._start = function(){
        if(!isInit) return;

        if(record){
            record.stop();
        }
        if(mic){
            mic.stopRecording();
        }
        console.log('SnowboyService start');
        _ref.isStop = false;

        /*var file = fs.createReadStream('node_modules/snowboy/resources/snowboy.wav');
        var reader = new wav.Reader();

        file.pipe(reader).pipe(detector);*/
        detector = new Detector({
            resource: "./node_modules/snowboy/resources/common.res",
            models: models,
            audioGain: 2.0
        });
        detector = new Detector({
            resource: "./node_modules/snowboy/resources/common.res",
            models: models,
            audioGain: 2.0
        });

        detector.on('silence', function () {
            //console.log('SnowboyService silence');
        });

        detector.on('sound', function (e) {
            console.log('SnowboyService sound');
            console.log(e);
        });

        detector.on('error', function (e) {
            console.log('SnowboyService error');
            console.log(e);
        });

        detector.on('hotword', function (index, hotword) {

            console.log('SnowboyService hotword', index, hotword);
            APP.services.SoundEmotionService.playSound('hello');
            _ref.stop();
        });

        clearInterval(_ref.timeoutStandBy);

        mic = new Mic();
        mic.on('info', function(info) {
            console.log(info);
        });
        mic.on('error', function(error) {
            console.log(error);
        });
        micStream = mic.startRecording();
        micStream.pipe( detector );

        /*mic = record.start({
            threshold: 0,
            sampleRate : 44100,
            recordProgram  : 'arecord',
            verbose: false,
            device: 'plughw:1,0'
        }).pipe(detector);*/
    };
    this.startTimeout = function(){
        clearInterval(_ref.timeoutStandBy);
        _ref.countStandBy = 0;
        _ref.timeoutStandBy = setInterval(function(){
            _ref.countStandBy++;

            if(_ref.countStandBy >= _ref.standByValue){
                clearInterval(_ref.timeoutStandBy);
                APP.services.SoundEmotionService.playSound('sad');
                _ref.start();
            }
        }, 1000);
    }
    this.stop = function(){
        if(!isInit) return;

        clearTimeout(_startTimeout);
        APP.models.TalkModel.islistening = true;
        APP.services.socketController.sendAction('listen_on', 'listen_on');
        //APP.services.talkServeCtrl.speech('Oui ?');

        _ref.startTimeout();

        _ref._stop();
    };

    this._stop = function(){
        if(!isInit) return;

        console.log('SnowboyService stop');
        if(record){
            record.stop();
        }
        if(mic){
            mic.stopRecording();
        }

        _ref.isStop = true;

    };

    return this;

});
var RSVP = require('rsvp');

APP.SoundEmotionService = (function(){

    var _ref = this;
    var _isInit = false;
    var Sound = false;

    var _dict = {};

    this.init = function(){

        try{
            Sound = require('node-aplay');
            _isInit = true;
        }catch(e){

        }

        _dict['hello'] = ['sound/004-bb8.wav'];
        _dict['sad'] = ['sound/009-bb8.wav'];
        _dict['off'] = ['sound/BB8 Powerdown 01 #000260.wav'];
        _dict['frustrated'] = ['sound/frustrated #000316.wav'];
        _dict['dontknow'] = ['sound/012-bb8.wav'];
        _dict['laugh'] = [
            'sound/014-bb8.wav',
            'sound/015-bb8.wav'
        ];
        _dict['happy'] = ['sound/BB8 Reactive Lift Happy #000318.wav'];
        _dict['maybe'] = ['sound/016-bb8.wav'];
        _dict['search'] = ['sound/002-bb8.wav'];
        _dict['yes'] = ['sound/004-bb8.wav', 'sound/Yes #000366.wav'];
        _dict['no'] = ['sound/005-bb8.wav', 'sound/No #000290.wav'];
        _dict['talk'] = [
            'sound/001-bb8.wav',
            'sound/003-bb8.wav',
            'sound/006-bb8.wav',
            'sound/007-bb8.wav',
            'sound/008-bb8.wav',
            'sound/010-bb8.wav',
            'sound/011-bb8.wav',
            'sound/013-bb8.wav',
            'sound/016-bb8.wav',
            'sound/017-bb8.wav',
            'sound/018-bb8.wav',
            'sound/014-bb8.wav',
            'sound/015-bb8.wav',
            'sound/angry #000309.wav',
            'sound/Ready 1 #000276.wav',
            'sound/yoohoo #000327.wav',
            'sound/Poke 2 #000332.wav',
            'sound/019-bb8.wav'
        ];

        _isInit = true;
    };

    this.playSound = function(id){
        if(!_isInit) _ref.init();

        if(!APP.configJSON.soundBB8) return;

        var url = _dict[id][Math.round(Math.random() * (_dict[id].length-1))];

        var sound = new Sound(url);
        sound.on('complete', function () {

        });
        sound.play();
    };

    return this;

});
APP.BddDAOMYSQL = function(){

    console.log("APP.BddDAO");

    this.callBacks;

    var mysql = require('mysql');
    var _ref = this;

    var connection = mysql.createConnection({
        host     : '192.168.0.10',
        user     : 'lia',
        password : '',
        database : 'lia',
        port : 3306
    });


    this.init = function(){
        console.log("APP.BddDAO init");


        // the callback inside connect is called when the connection is good
        connection.connect(function(err){
            if (err) return console.log("Error " + err);
            console.log("connected to the base");
        });
    };

    this.execute = function(table, where, callback){


        // SELECT
        var sql = "SELECT * FROM " + table + " " + where;
        console.log(' QUERY ' + sql);
        connection.query(sql, function(err, rows, fields) {
            if (err) return console.log("Error " + err);

            var datas = [];
            var obj;
            var i = 0;
            var nb = rows.length;
            if(rows && rows.length > 0){
                switch(table){
                    case APP.services.RobotModel.TABLE_WORDS_WAKE:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_ANSWER_WAKE:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            //obj.type = rows[i].type;
                            //obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_LEARN:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_PERSON:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.name = rows[i].name;
                            obj.info = rows[i].info;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_OBJECT:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.name = rows[i].name;
                            obj.info = rows[i].info;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                }
            }
            if(datas && callback){
                callback('QUERY_RESULT', datas);
            }

        });

    };
    this.save = function(table, obj, callback){

        // INSERT
        var sql = "INSERT INTO `" + table + "`(`name`, `info`, `rank`) VALUES ('" + obj.name + "','" + obj.info + "',0)";
        console.log(' INSERT ' + sql);
        connection.query(sql, function(err) {
            if (err) return console.log("Error " + err);

            if(callback){
                callback('INSERT_RESULT');
            }
        });
    };

    this.init();

    return this;

};
APP.BddMongoDAO = function(){

    console.log("APP.BddMongoDAO");

    this.db = null;
    var _ref = this;
    var MONGO_CLIENT = {
        IP: '192.168.0.18',
        PORT: 27017,
        DATABASE: 'lia',
        PASS: ''
    };

    this.init = function(){
        console.log("APP.BddMongoDAO init");

        var MongoClient = require("mongodb").MongoClient;
        MongoClient.connect("mongodb://" + MONGO_CLIENT.IP + ":" + MONGO_CLIENT.PORT + "/" + MONGO_CLIENT.DATABASE, function(error, db) {
            if (error) {
                console.log("error " + error);
                return;
            }
            console.log("Connecté à la base de données 'lia'");

            _ref.db = db;


            var objNew = {
                name: 'Michel',
                datas: {
                    cat: 'gege',
                    cat2: 'test r'
                }
            };

            //db.collection("personnages").update({name: 'Michel'}, objNew);

            var objToFind     = { name: 'Michel' };

            db.collection("personnages").findOne(objToFind, function(error, result) {
                if (error) throw error;

                console.log(result);

            });

        });
    };

    this.init();

    return this;

};
var RSVP = require('rsvp');

APP.MusicService = (function(){

    var _ref = this;
    const fs = require('fs');

    var _currentPlayList = null;
    var _currentIndexPlaylist = 0;
    var _list = [];
    var _listNetwork = [];

    this.networkLibLoaded = false;
    this.networkAvailable = false;
    this.networkLibPath = [];


    this.getListMusic = function(path, network){

        return new RSVP.Promise(function(resolve, reject) {
            var nb;
            var countDir = 1;
            var countDirComplete = 0;

            var func = function(path, network){
                fs.readdir(path, function(err, files) {
                    if(err){
                        countDirComplete++;
                        if(countDir == 1){
                            reject();
                        }else{
                            console.log('   ' + path + ' : ' + 'ERROR');
                        }
                        return;
                    }
                    countDirComplete++;

                    nb = files.length;
                    for (var i = 0; i < nb; i++) {
                        if(files[i].indexOf('.mp3') != -1){
                            if(network == true){
                                _listNetwork.push(path + files[i]);
                            }else{
                                _list.push(path + files[i]);
                            }
                        }else if(files[i].indexOf('.') == -1){
                            countDir++;
                            func(path + files[i] + '/', network);
                        }
                    }
                    if(countDir == countDirComplete ){
                        if(network == true){
                            console.log('   NB MP3 : ' + _listNetwork.length);
                        }else{
                            console.log('   NB MP3 : ' + _list.length);
                        }

                        resolve();
                    }
                });
            };

            func(path, network);


        });


    };
    this.getListNetworkMusic = function(){
        console.log('>> Scan Lib music network');

        return new RSVP.Promise(function(resolve, reject) {
            var count = 0;
            var nextNetworkPath = function(){
                _ref.getListMusic(_ref.networkLibPath[count], true).then(function(){
                    console.log('   ' + _ref.networkLibPath[count] + ' : ' + 'OK');
                    count++;
                    if(count == _ref.networkLibPath.length){
                        _ref.networkLibLoaded = true;
                        resolve();
                    }else{
                        nextNetworkPath();
                    }
                }).catch(function(){
                    _ref.networkLibLoaded = false;
                    console.log('   ' + _ref.networkLibPath[count] + ' : ' + 'ERROR');
                    reject();
                });
            };

            nextNetworkPath();

        });


    };
    this.search = function(words){
        return new RSVP.Promise(function(resolve, reject) {

            console.log('Search music : ' + words);

            var tabWords = words;
            var result = [];
            var list = _list;
            if(_ref.networkAvailable){
                list = list.concat(_listNetwork);
            }
            var nb = list.length;
            var nb2 = tabWords.length;
            var flag = false;

            for (var i = 0; i < nb; i++) {
                flag = false;
                for (var j = 0; j < nb2; j++) {
                    if(!flag && list[i].toLowerCase().indexOf(tabWords[j]) != -1) {
                        result.push(list[i]);
                        flag = true;
                    }
                }
            }

            console.log('Result ');
            console.log(result);

            resolve(result);


        });
    };
    this.checkNetwork = function() {
        console.log('>> Check Lib music network is available');
        return new RSVP.Promise(function(resolve, reject) {
            var flag = false;
            setTimeout(function(){
                flag = true;
                console.log('   '  + _ref.networkLibPath[0] + ' : NO');
                reject();
            }, 2500);

            fs.readdir(_ref.networkLibPath[0], function(err, files) {
                if(!flag){
                    if (err) {
                        console.log('   '  + _ref.networkLibPath[0] + ' : NO');
                        reject();
                    }else{
                        console.log('   '  + _ref.networkLibPath[0] + ' : YES');
                        resolve();
                    }
                }
            });
        });
    };
    this.playList = function(result) {

        _currentPlayList = result;
        _currentIndexPlaylist = 0;
        _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
    };

    this.playAll = function() {
        var result = _list;
        if(_ref.networkAvailable){
            list = result.concat(_listNetwork);
        }

        _currentPlayList = result;
        _currentIndexPlaylist = 0;
        _ref.playMusic(_currentPlayList[_currentIndexPlaylist], true);
    };

    this.playMusic = function(value, shuffle) {

        var exec = require('child_process').exec;
        var child = shuffle ? exec('mocp -o shuffle') : exec('mocp -u shuffle');
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            var list = '';
            var nb = _currentPlayList.length-1;
            var indexTemp = _currentPlayList.indexOf(value);
            var count = 0;
            for (var i = indexTemp; i < nb; i++) {
                if(i >= indexTemp ){
                    if( count > 0) {
                        list += ' ';
                    }
                    list += '"' + _currentPlayList[i] + '"';
                    count++;
                }
            }

            console.log('mocp -l ' + list);

            child = exec('mocp -l ' + list);
            child.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            child.stderr.on('data', function(data) {
                console.log('stdout: ' + data);

            });
            child.on('close', function(code) {
                console.log('closing code: ' + code);
            });
        });
    };
    this.nextList = function() {
        if(_currentIndexPlaylist+1 < _currentPlayList.length){
            _currentIndexPlaylist++;

            _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
        }
    };
    this.prevList = function() {
        if(_currentIndexPlaylist-1 >= 0){
            _currentIndexPlaylist--;

            _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
        }
    };

    this.next = function() {
        if(_currentPlayList) {
            _ref.nextList();
        }else{
            _ref.exec('mocp -f');
        }
    };

    this.prev = function() {
        if(_currentPlayList) {
            _ref.prevList();
        }else{
            _ref.exec('mocp -r');
        }
    };

    this.shuffle = function() {
        _ref.exec('mocp -o shuffle');
    };

    this.noshuffle = function() {
        _ref.exec('mocp -u shuffle');
    };

    this.forwind = function() {
        _ref.exec('mocp -k 30');
    };

    this.pause = function() {
        _ref.exec('mocp -P');
    };

    this.resume = function() {
        _ref.exec('mocp -U');
    };

    this.stop = function() {
        _ref.exec('mocp -s');
        _currentPlayList = null;
    };

    this.exec = function(str) {

        var exec = require('child_process').exec;
        var child = exec(str);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };

    this.getCurrentTitle = function(){
        var title = _currentPlayList[_currentIndexPlaylist];
        var tab = title.split('/');
        title = tab[tab.length-1];
        title = title.substr(0, title.length -4);
        return title;
    };
    return this;

});
var EventBus = require('eventbusjs');

APP.RobotDAO = function(){
    this.ON_INFO = 'RobotDAO.ON_INFO';
    this.ON_INIT = 'RobotDAO.ON_INIT';

    this.disabled = false;

    var _ref = this;
    var fs = require('fs');
    var isRun = false;

    var speedBoth = 0;
    var speedLeft = 0;
    var speedRight = 0;

    var timeoutSpeedLeft = -1;
    var timeoutSpeedRight = -1;
    var timeoutStop = -1;
    var timeoutStart = -1;
    var timeoutSpeedValue = 100;
    var timeoutStopValue = 1000;
    var isMove = false;

    var Gopigo;

    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    try {
        Gopigo = require('node-gopigo').Gopigo;
    }catch(e) {
        this.disabled = true;
        return;
    }

    var Commands = Gopigo.commands;
    var Robot = Gopigo.robot
    var robot
    var readline = require('readline');

    var rl = readline.createInterface({
        input : process.stdin,
        output: process.stdout
    });

    //var ultrasonicPin = 15
    //var irreceiverPin = 8

    console.log(' Welcome to the GoPiGo test application             ')
    console.log(' When asked, insert a command to test your GoPiGo   ')
    console.log(' (!) For a complete list of commands, please type help')

    robot = new Robot({
        minVoltage: 5.5,
        criticalVoltage: 5.5,
        debug: true
        //ultrasonicSensorPin: ultrasonicPin,
        //IRReceiverSensorPin: irreceiverP
    });
    robot.on('init', function onInit(res) {
        if (res) {
            console.log('GoPiGo Ready!');
            robot.motion.disableCommunicationTimeout();
            robot.encoders.disable();
        } else {
            console.log('Something went wrong during the init.')
        }
    });
    robot.on('error', function onError(err) {
        console.log('Something went wrong')
        console.log(err)
    });
    robot.on('free', function onFree() {
        console.log('GoPiGo is free to go')
    });
    robot.on('halt', function onHalt() {
        console.log('GoPiGo is halted')
    });
    robot.on('close', function onClose() {
        console.log('GoPiGo is going to sleep')
    });
    robot.on('reset', function onReset() {
        console.log('GoPiGo is resetting')
    });
    robot.on('normalVoltage', function onNormalVoltage(voltage) {
        console.log('Voltage is ok [' + voltage + ']');
        EventBus.dispatch(_ref.ON_INFO, _ref, APP.SOCKET_MESSAGE.VOLTAGE_NORMAL);
    });
    robot.on('lowVoltage', function onLowVoltage(voltage) {
        console.log('(!!) Voltage is low [' + voltage + ']');
        EventBus.dispatch(_ref.ON_INFO, _ref, APP.SOCKET_MESSAGE.VOLTAGE_LOW);

    });
    robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
        console.log('(!!!) Voltage is critical [' + voltage + ']');
        EventBus.dispatch(_ref.ON_INFO, _ref, APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL);

    });
    robot.init();


    this.init = function(){
        console.log("APP.RobotDAO init");
        EventBus.dispatch(_ref.ON_INIT, _ref);

    };
    this.getVoltage = function(){
        try{
            return (robot.board.getVoltage()  / 12);
        }catch(e){
            return 0;
        }
    };
    this.speedsMotors = function(isForward, speedMotorLeft, speedMotorRight){

        if(speedMotorLeft > 20 || speedMotorRight > 20){
            if(speedMotorLeft != speedLeft && Math.abs(speedMotorLeft-speedLeft) > 10){
                if(timeoutSpeedLeft != -1){
                    clearTimeout(timeoutSpeedLeft);
                }
                if(isRun){
                    timeoutSpeedLeft = setTimeout(function(){
                        robot.motion.setLeftSpeed(speedLeft);
                    }, timeoutSpeedValue);
                }else{
                    robot.motion.setLeftSpeed(speedLeft);
                }

            }
            if(speedMotorRight != speedRight && Math.abs(speedMotorRight-speedRight) > 10){
                if(timeoutSpeedRight != -1){
                    clearTimeout(timeoutSpeedRight);
                }
                if(isRun){
                    timeoutSpeedRight = setTimeout(function(){
                        robot.motion.setRightSpeed(speedRight);
                    }, timeoutSpeedValue);
                }else{
                    robot.motion.setRightSpeed(speedRight);
                }
            }
            speedLeft = speedMotorLeft;
            speedRight = speedMotorRight;
            if(!isRun){
                if(timeoutStop != -1){
                    clearTimeout(timeoutStop);
                }
                isRun = true;
                if(isForward){
                    robot.motion.forward(false);
                }else{
                    robot.motion.backward(false);
                }
            }

        }else{
            if(isRun){
                isRun = false;
                if(timeoutSpeedRight != -1){
                    clearTimeout(timeoutSpeedRight);
                }
                if(timeoutSpeedLeft != -1){
                    clearTimeout(timeoutSpeedLeft);
                }
                if(timeoutStop != -1){
                    clearTimeout(timeoutStop);
                }

                deccelerate(1);

            }

        }

    };

    function deccelerate(pass){
        var flag = false;
        if(speedLeft > 50){
            speedLeft = Math.floor(4*speedLeft / 3);
            robot.motion.setLeftSpeed(speedLeft);
        }else{
            speedLeft = 0;
            robot.motion.setLeftSpeed(speedLeft);
        }
        if(speedRight > 50){
            speedRight = Math.floor(4*speedRight / 3);
            robot.motion.setRightSpeed(speedRight);
        }else{
            speedRight = 0;
            robot.motion.setRightSpeed(speedRight);
        }
        if(flag){
            timeoutStop = setTimeout(function(){
                deccelerate(pass+1);
            }, Math.floor(((speedLeft > speedRight ? speedLeft : speedRight)*timeoutStopValue/255) ));
        }else{
            robot.motion.stop();
        }
    };
    function deccelerate2(pass){
        if(speedBoth >= 60){
            speedBoth -= 15;
            robot.motion.setSpeed(speedBoth);
            //robot.motion.decreaseSpeed(); // decrease of 10
            timeoutStop = setTimeout(function(){
                deccelerate2(pass+1);
            }, 40);
        }else{
            speedBoth = 50;
            robot.motion.stop();
        }
    };
    function accelerate2(pass){
        if(speedBoth < 250){
            speedBoth += 15;
            robot.motion.setSpeed(speedBoth);
            //robot.motion.increaseSpeed();
            timeoutStart = setTimeout(function(){
                accelerate2(pass+1);
            }, 40);
        }
    };
    this.fwd = function(){
        isMove = true;
        speedBoth = 100;
        robot.motion.setSpeed(speedBoth);
        robot.motion.forward(false);
        if(timeoutStop != -1){
            clearTimeout(timeoutStop);
        }
        if(timeoutStart != -1){
            clearTimeout(timeoutStart);
        }
        accelerate2(1);
    };
    this.backward = function(){
        isMove = true;
        speedBoth = 100;
        robot.motion.setSpeed(speedBoth);
        robot.motion.backward(false);
        if(timeoutStop != -1){
            clearTimeout(timeoutStop);
        }
        if(timeoutStart != -1){
            clearTimeout(timeoutStart);
        }
        accelerate2(1);
    };
    this.rotateLeft = function(){
        robot.motion.setSpeed(200);
        robot.motion.leftWithRotation();
    };
    this.rotateRight = function(){
        robot.motion.setSpeed(200);
        robot.motion.rightWithRotation();
    };
    this.stop = function(){
        if(isMove){
            isMove = false;
            if(timeoutStop != -1){
                clearTimeout(timeoutStop);
            }
            if(timeoutStart != -1){
                clearTimeout(timeoutStart);
            }
            deccelerate2(1);
        }else{
            robot.motion.stop();
        }
    };
    this.init();

    return this;

};
APP.TestRobot = function() {

    var Gopigo = require('node-gopigo').Gopigo
    var Commands = Gopigo.commands
    var Robot = Gopigo.robot
    var robot
    var readline = require('readline')

    var rl = readline.createInterface({
        input : process.stdin,
        output: process.stdout
    });

    //var ultrasonicPin = 15
    //var irreceiverPin = 8

    console.log(' Welcome to the GoPiGo test application             ')
    console.log(' When asked, insert a command to test your GoPiGo   ')
    console.log(' (!) For a complete list of commands, please type help')

    robot = new Robot({
        minVoltage: 5.5,
        criticalVoltage: 1.2,
        debug: true
        //ultrasonicSensorPin: ultrasonicPin,
        //IRReceiverSensorPin: irreceiverP
    })
    robot.on('init', function onInit(res) {
        if (res) {
            console.log('GoPiGo Ready!')
            console.log("checkStatus " + robot.checkStatus());
            askForCommand()
        } else {
            console.log('Something went wrong during the init.')
        }
    })
    robot.on('error', function onError(err) {
        console.log('Something went wrong')
        console.log(err)
    })
    robot.on('free', function onFree() {
        console.log('GoPiGo is free to go')
    })
    robot.on('halt', function onHalt() {
        console.log('GoPiGo is halted')
    })
    robot.on('close', function onClose() {
        console.log('GoPiGo is going to sleep')
    })
    robot.on('reset', function onReset() {
        console.log('GoPiGo is resetting')
    })
    robot.on('normalVoltage', function onNormalVoltage(voltage) {
        console.log('Voltage is ok [' + voltage + ']')
    })
    robot.on('lowVoltage', function onLowVoltage(voltage) {
        console.log('(!!) Voltage is low [' + voltage + ']')
    })
    robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
        console.log('(!!!) Voltage is critical [' + voltage + ']')
    })
    robot.init()

    function askForCommand() {
        rl.question('What do you want me to do? > ', function (answer) {
            handleAnswer(answer)
        })
    }

    function handleAnswer(answer) {
        var message = ''
        switch (answer) {
            case 'help':
                console.log('')
                console.log('reset => performs a reset of LEDs and servo motor')
                console.log('left led on => turn left led on')
                console.log('left led off => turn left led off')
                console.log('right led on => turn right led on')
                console.log('right led off => turn right led off')
                console.log('move forward => moves the GoPiGo forward')
                console.log('move backward => moves the GoPiGo backward')
                console.log('turn left => turns the GoPiGo to the left')
                console.log('turn right => turns the GoPiGo to the right')
                console.log('stop => stops the GoPiGo')
                console.log('increase speed => increases the motors speed')
                console.log('decrease speed => decreases the motors speed')
                console.log('voltage => returns the voltage value')
                console.log('servo test => performs a servo test')
                console.log('ultrasonic distance => returns the distance from an object')
                console.log('move forward with PID => moves the GoPiGo forward with PID')
                console.log('move backward with PID => moves the GoPiGo backward with PID')
                console.log('rotate left => rotates the GoPiGo to the left')
                console.log('rotate right => rotates the GoPiGo to the right')
                console.log('set encoder targeting => sets the encoder targeting')
                console.log('firmware version => returns the firmware version')
                console.log('board revision => returns the board revision')
                console.log('ir receive => returns the data from the IR receiver')
                console.log('exit => exits from this test')
                console.log('')
                break
            case 'reset':
                robot.reset()
                break
            case 'left led on':
                var res = robot.ledLeft.on()
                console.log('Left led on::' + res)
                break
            case 'left led off':
                var res = robot.ledLeft.off()
                console.log('Left led off::' + res)
                break
            case 'right led on':
                var res = robot.ledRight.on()
                console.log('Right led on::' + res)
                break
            case 'right led off':
                var res = robot.ledRight.off()
                console.log('Right led off::' + res)
                break
            case 'move forward':
            case 'w':
                var res = robot.motion.forward(false)
                console.log('Moving forward::' + res)
                break
            case 'turn left':
            case 'a':
                var res = robot.motion.left()
                console.log('Turning left::' + res)
                break
            case 'turn right':
            case 'd':
                var res = robot.motion.right()
                console.log('Turning right::' + res)
                break
            case 'move backward':
            case 's':
                var res = robot.motion.backward(false)
                console.log('Moving backward::' + res)
                break
            case 'stop':
            case 'x':
                var res = robot.motion.stop()
                console.log('Stop::' + res)
                break
            case 'increase speed':
            case 't':
                var res = robot.motion.increaseSpeed()
                console.log('Increasing speed::' + res)
                break
            case 'decrease speed':
            case 'g':
                var res = robot.motion.decreaseSpeed()
                console.log('Decreasing speed::' + res)
                break
            case 'setLeftSpeed100':
                var res = robot.motion.setLeftSpeed(100)
                break
            case 'setLeftSpeed0':
                var res = robot.motion.setLeftSpeed(0)
                break
            case 'setRightSpeed100':
                var res = robot.motion.setRightSpeed(100)
                break
            case 'setRightSpeed0':
                var res = robot.motion.setRightSpeed(0)
                break
            case 'voltage':
            case 'v':
                var res = robot.board.getVoltage()
                console.log('Voltage::' + res + ' V')
                break
            case 'servo test':
            case 'b':
                robot.servo.move(0)
                console.log('Servo in position 0')

                robot.board.wait(1000)
                robot.servo.move(180)
                console.log('Servo in position 180')

                robot.board.wait(1000)
                robot.servo.move(90)
                console.log('Servo in position 90')
                break
            case 'exit':
            case 'z':
                robot.close()
                process.exit()
                break
            case 'ultrasonic distance':
            case 'u':
                var res = robot.ultraSonicSensor.getDistance()
                console.log('Ultrasonic Distance::' + res + ' cm')
                break
            case 'ir receive':
                var res = robot.IRReceiverSensor.read()
                console.log('IR Receiver data::')
                console.log(res)
                break
            case 'l':
                // TODO
                break
            case 'move forward with pid':
            case 'i':
                var res = robot.motion.forward(true)
                console.log('Moving forward::' + res)
                break
            case 'move backward with pid':
            case 'k':
                var res = robot.motion.backward(true)
                console.log('Moving backward::' + res)
                break
            case 'rotate left':
            case 'n':
                var res = robot.motion.leftWithRotation()
                console.log('Rotating left::' + res)
                break
            case 'rotate right':
            case 'm':
                var res = robot.motion.rightWithRotation()
                console.log('Rotating right::' + res)
                break
            case 'set encoder targeting':
            case 'y':
                var res = robot.encoders.targeting(1, 1, 18)
                console.log('Setting encoder targeting:1:1:18::' + res)
                break
            case 'firmware version':
            case 'f':
                var res = robot.board.version()
                console.log('Firmware version::' + res)
                break
            case 'board revision':
                var res = robot.board.revision()
                console.log('Board revision::' + res)
                break
        }

        robot.board.wait(1000)
        askForCommand()
    }

    return this;
};var RSVP = require('rsvp');
var https = require('https');
var http = require('http');
var Xml2js = require('xml2js');
var Html5Entities = require('html-entities').Html5Entities;

APP.SearchService = (function(){

    this.newsList = [];
    this.currentIndex = 0;

    this.search = function(searchValue){
        var value = '';

        for (var i = 0; i < searchValue.length; i++) {
            if(i != 0){
                value += '+';
            }
            if(searchValue[i] != 'de' && i == 0){
                value += searchValue[i].charAt(0).toUpperCase() + searchValue[i].substr(1, searchValue[i].length);
            }else{
                value += searchValue[i];
            }
        }

        return new RSVP.Promise(function(resolve, reject){
            console.log('SearchService search ' + value);

            var urlSearch = 'https://fr.wikipedia.org/w/index.php?title=Spécial%3ARecherche&profile=default&fulltext=1&searchengineselect=mediawiki&search=' + encodeURI(value);
            var url = 'https:' + '//cors-anywhere.herokuapp.com/' + urlSearch;

            console.log(urlSearch);

            https.get(urlSearch, function(response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('error', function(d) {
                    reject();
                });
                response.on('end', function() {

                    var ret = [];
                    console.log('SearchService result');
                    //console.log(body);

                    var str = body;
                    var index = body.indexOf('mw-content-text');
                    var indexpartSearch = body.indexOf('mw-search-results');

                    if(indexpartSearch > -1) {
                      str = str.substr(indexpartSearch, str.length);
                      index = str.indexOf('<a');
                      str = str.substr(index, str.length);
                      index = str.indexOf('href="');
                      str = str.substr(index+6, str.length);
                      index = str.indexOf('"');
                      str = str.substr(0, index);

                      console.log('page to load ' + str);
                      https.get('https://fr.wikipedia.org' + str, function(response) {
                          // Continuously update stream with data
                          var body2 = '';
                          response.on('data', function(d) {
                              body2 += d;
                          });
                          response.on('error', function(d) {
                              reject();
                          });
                          response.on('end', function() {
                            str = body2;
                            index = str.indexOf('mw-content-text');

                            str = str.substr(index, str.length);

                            index = str.indexOf('bandeau-article');
                            if(index > -1){
                                str = str.substr(index, str.length);
                                index = str.indexOf('<div');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('<div');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('</div>');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('</div>');
                                str = str.substr(index+1, str.length);
                            }

                            index = str.indexOf('<p>');
                            str = str.substr(index, str.length);
                            str = str.substr(3, str.indexOf('</p>') - 3);

                            ret.push({
                                text: Html5Entities.decode(str.replace(/<[^>]*>/g, ""))
                            });

                            resolve(ret);
                          });
                      });

                    }else{
                      str = str.substr(index, str.length);

                      index = str.indexOf('bandeau-article');
                      if(index > -1){
                          index = str.indexOf('<p>');
                          str = str.substr(index, str.length);
                          str = str.substr(3, str.indexOf('</p>'));
                      }

                      index = str.indexOf('<p>');
                      str = str.substr(index, str.length);
                      str = str.substr(3, str.indexOf('</p>') - 3);

                      ret.push({
                          text: Html5Entities.decode(str.replace(/<[^>]*>/g, ""))
                      });

                      resolve(ret);
                    }


                });
            });

        });


    };

    this.getNews = function() {
      var rssLeMonde = 'http://www.lemonde.fr/rss/une.xml';
      var ref = this;

      return new RSVP.Promise(function(resolve, reject){
        console.log(rssLeMonde);

        http.get(rssLeMonde, function(response) {
            // Continuously update stream with data
            console.log('Response getNews');
            var xmlStr = '';
            response.on('data', function(d) {
                xmlStr += d;
            });
            response.on('error', function(d) {
                console.log('Error getNews');
                console.log(e);
                reject();
            });
            response.on('end', function() {
              var ret = [];
              console.log('Success getNews');
              //console.log(xmlStr);
              Xml2js.parseString(xmlStr, function (err, result) {
                  console.log(result);
                  console.log( result.rss.channel[0]);
                  var i, nb ;
                  var item;
                  nb = result.rss.channel[0].item.length;
                  for(var i = 0; i < nb; i++) {
                    item = result.rss.channel[0].item[i];
                    ret.push(
                      {
                        title: item.title,
                        description: item.description
                      });
                  }
                  ref.newsList = ret;
                  resolve(ret);
              });
            });
          });
      });
    }

    return this;
});
var RSVP = require('rsvp');
var EventBus = require('eventbusjs');

APP.TemperatureService = (function(){
    this.ON_CHECK_TEMPERATURE = 'DevicesService.ON_CHECK_TEMPERATURE';

    var _ref = this;
    var _intervalTemperature = 0;
    var _timeCheckTemperature = 10; // minutes
    var _countInterval = 0;


    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    this.getTemperature = function(){

        return new RSVP.Promise(function(resolve, reject){
            //linuxb
            var linuxCmd = 'sudo /home/pi/temperature.sh';

            var exec = require('child_process').exec;
            var child = exec(linuxCmd);
            var str = '';
            child.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
                str += data + '::';
            });
            child.stderr.on('data', function(data) {
                console.log('stdout: ' + data);

                reject();
            });
            child.on('close', function(code) {
                console.log('closing code: ' + code);
                var tab = str.split('::');

                resolve({
                    ext: Math.round(parseFloat(tab[1])),
                    int: Math.round(parseFloat(tab[3]))
                })
            });

        });
    };

    this.startCheckTemperature = function(){
        clearInterval(_intervalTemperature);

        _intervalTemperature = setInterval(function(){
            _countInterval++;

            if(_countInterval >= _timeCheckTemperature){
                _ref.getTemperature().then(function(data){
                    EventBus.dispatch(_ref.ON_CHECK_TEMPERATURE, _ref, data);
                });
                _countInterval = 0;
            }

        }, 60000);
    };

    this.stopCheckTemperature = function(){
        clearInterval(_intervalTemperature);
    };


    return this;

});
var RSVP = require('rsvp');

APP.VideoService = (function(){

    var _ref = this;
    var _currentIndex = 0;
    var _currentChild = null;

    this.listVideos = [];


    this.setListVideos = function(value){
        console.log('setListVideos');
        console.log(value);

        _currentIndex = 0;
        _ref.listVideos = value;
    };

    this.play = function(){
        return _ref.playVideo(_ref.listVideos[_currentIndex]);
    };

    this.playVideo = function(obj){

        var url = obj.url;
        var title = obj.title;

        console.log('playVideo ' + url);
        console.log('title ' + title);
        var host = '';

        // windows
        var winCmd = 'start';

        //linus
        var linuxCmd = 'epiphany-browser';


        //opn(host + url, {app: 'firefox'});
        /*opn(host + url).then(function(){

        }).catch(function(error){
            console.log(error);
        });*/

        var handler = function(){
            var exec = require('child_process').exec;
            _currentChild = exec(linuxCmd + ' "' + host + url + '"');
            _currentChild.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            _currentChild.stderr.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            _currentChild.on('close', function(code) {
                console.log('closing code: ' + code);
            });

        }

        if(_currentChild){
            _ref.closeVideo(function(){
                handler();
            });
        }else{
            handler();
        }

        return new RSVP.Promise(function(resolve, reject){
            resolve(title);
        });
    };
    this.closeVideo = function(callback){

        // windows
        var winCmd = 'taskkill /f /im vivaldi.exe';

        //linus
        var linuxCmd = 'sudo killall epiphany-browser';

        _currentChild = null;

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);

            if(callback){
                callback();
            }
        });
    };

    this.nextVideo = function(){
        _currentIndex++;
        if(_currentIndex < _ref.listVideos.length){
            return _ref.playVideo(_ref.listVideos[_currentIndex]);
        }
    };
    this.prevVideo = function(){
        _currentIndex--;
        if(_currentIndex >= 0){
            return _ref.playVideo(_ref.listVideos[_currentIndex]);
        }
    };
    this.randomVideo = function(){
        var randomIndex = _currentIndex;
        while(randomIndex == _currentIndex){
            randomIndex = parseInt(Math.random() * (_ref.listVideos.length-1));
        }

        _currentIndex = randomIndex;
        return _ref.playVideo(_ref.listVideos[_currentIndex]);
    };

    return this;

});
var RSVP = require('rsvp');
var https = require('https');
var Html5Entities = require('html-entities').Html5Entities;

APP.YoutubeService = function(){


    this.search = function(searchValue){
        var value = '';
        var isUrlyoutube = false;

        if(searchValue.indexOf('https://www.youtube.com') != -1){
            isUrlyoutube = true;
            value = searchValue;
        }else{
            value = '';
            for (var i = 0; i < searchValue.length; i++) {
                if(i != 0){
                    value += '+';
                }
                value += searchValue[i];
            }
        }

        return new RSVP.Promise(function(resolve, reject){
            console.log('YoutubeService search ' + value);

            var urlSearch;
            if(isUrlyoutube){
                urlSearch = value;
            }else{
                urlSearch = 'https://www.youtube.com/results?search_query=' + encodeURI(value);
            }
            var url = 'https:' + '//cors-anywhere.herokuapp.com/' + urlSearch;

            //console.log(url);

            https.get(urlSearch, function(response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('error', function(d) {
                    reject();
                });
                response.on('end', function() {

                    console.log('YoutubeService result');
                    //alert(body);

                    var str = body;
                    var urlsVideos = [];
                    var index = str.indexOf('/watch?v=');
                    var temp;
                    var urlVideo;
                    var title;
                    var lastUrlVideo;

                    //alert(index);

                    var count = 0;
                    while(index != -1){

                        temp = str.substr(index, str.length);
                        urlVideo = str.substr(index, temp.indexOf('"'));
                        str = str.substr(index + temp.indexOf('"') + 1 , str.length);

                        if(!isUrlyoutube || (isUrlyoutube && count > 0)){
                            if(urlVideo == lastUrlVideo){
                                // recup title
                                index = str.indexOf('>');
                                str = str.substr(index + 1 , str.length);
                                index = str.indexOf('<');
                                title = str.substr(0, index);

                                urlsVideos.push({
                                    urlVideo: 'https://www.youtube.com' + urlVideo,
                                    title: Html5Entities.decode(title.replace('\n', '').replace('\n', '').replace(/^\s\s*/, '').replace(/\s\s*$/, ''))
                                });
                            }
                            lastUrlVideo = urlVideo;
                        }

                        index = str.indexOf('/watch?v=');
                        count++;
                    }

                    //console.log(urlsVideos);

                    var ret = '';
                    for (var i = 0; i < urlsVideos.length; i++) {
                        if(i != 0){
                            ret += '---';
                        }
                        ret += urlsVideos[i].urlVideo + '||' + urlsVideos[i].title;
                    }

                    //alert(urlsVideos);
                    //alert(ret);
                    resolve(ret);
                });
            });

        });


    };

    return this;
};
APP.CommandsModel = function(){

    var _ref = this;
    this.wordsToIgnore = 'le la les des de sa son se un une mes me ma mon'.split(' ');

    this.LISTENING_WORDS_ACTION = [];

    return this;

};
APP.TalkModel = function(){

    var _ref = this;

    this.islistening = false;

    this.wordsToIgnore = 'le la les des de sa son se un une mes me ma mon'.split(' ');

    // BDD TABLES
    this.CATEGORY_INFOS_LEARNING = [
        {
            id: 'gotName',
            type: 'learn',
            nameTable: 'personnages',
            questions: ['Comment tu tappel ?'],
            confirm: ['Tu tappel {0}. Tu confirmes ?'],
            answers: ['Tu tappel {0}'],
            wordsToIgnore: 'appel m\'appel'
        },
        {
            id: 'gotLike',
            type: 'learn',
            nameTable: 'personnages_like',
            questions: ['{name} quest ce que tu aimes ?'],
            confirm: ['Tu aimes {0}. Tu confirmes ?'],
            answers: ['Je te connais un peu {name}. Tu aimes {0}'],
            wordsToIgnore: 'aime j\'aime adore j\'adore'
        },
        {
            id: 'gotWord',
            type: 'learn',
            nameTable: 'words',
            questions: ['Quest ce que {0} ?'],
            confirm: ['C\'est {0}. Tu confirmes ?'],
            answers: ['C\'est {0}'],
            wordsToIgnore: ''
        }
    ];


    this.LISTENING_WORDS_TALK = [
        {
            id: 'talk_1',
            keyWords: 'salut',
            type: 'talk',
            answer: ['Salut'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        },
        {
            id: 'talk_2',
            keyWords: 'comment tu t\'appel',
            type: 'talk',
            answer: ['Je m\'appel Liya'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        },
        {
            id: 'talk_3',
            keyWords: 'qui es tu',
            type: 'talk',
            answer: ['je suis une intelligence artificiel créé par Michel Pereira.'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        }
    ];

    this.getProcessLearning = function(id){
        var ret;
        var nb = _ref.CATEGORY_INFOS_LEARNING.length;
        for (var i = 0; i < nb; i++) {
            if(_ref.CATEGORY_INFOS_LEARNING[i].id == id){
                ret = _ref.CATEGORY_INFOS_LEARNING[i];
            }
        }
        return ret;
    };

    this.getRandomInitiative = function(process, nameClient){
        var index;
        var processLearning;

        if(nameClient) {
            index = Math.floor(Math.random() * process.initiatives.length);
            processLearning = APP.services.RobotModel.getProcessLearning(process.initiatives[index]);
        }else{
            index = Math.floor(Math.random() * process.initiativesNoName.length);
            processLearning = APP.services.RobotModel.getProcessLearning(process.initiativesNoName[index]);
        }

        return processLearning;
    };
    this.getQuestionsRandom = function(processLearning, nameClient){
        var ret = processLearning.questions[0];

        if(nameClient){
            ret = ret.replace('{name}', nameClient);
        }
        switch (processLearning.id){
            case 'gotWord':
                ret = ret.replace('{0}', 'oiseau');
                break;
        }

        return ret;
    };
    return this;

};
APP.DispatcherCommands = function(){

    this.lastServiceLaunch = null;
    var _ref = this;

    this.run = function(words, powerFullProcess, lastServiceLaunch){

        _ref.lastServiceLaunch = lastServiceLaunch;

        return new RSVP.Promise(function(resolve, reject){
            var command;
            var CommandClass;

            if(powerFullProcess.commandClasses && powerFullProcess.commandClasses.length > 0){

                if(!powerFullProcess.module ||
                    (powerFullProcess.module && APP.modules[powerFullProcess.module])) {
                    CommandClass = APP[powerFullProcess.commandClasses[0]];
                    command = new CommandClass(_ref);
                    command.execute(resolve, powerFullProcess, words, lastServiceLaunch, true);
                }else{
                    console.log("----------");
                    console.log("ERROR module " + powerFullProcess.module + ' not exist');
                    console.log("----------");
                    resolve();
                }
            }else if(powerFullProcess.dependanciesCommandClasses && powerFullProcess.dependanciesCommandClasses[_ref.lastServiceLaunch]) {
                CommandClass = APP[powerFullProcess.dependanciesCommandClasses[_ref.lastServiceLaunch]];
                command = new CommandClass(_ref);
                command.execute(resolve, powerFullProcess, words, lastServiceLaunch);
            }else{
                resolve();
            }

        });
    };

    return this;
};
APP.TalkServeCtrl = function(){


    var isLoading = false;

    var processLearning = null;
    var confirmStep = false;
    var wordToConfirm = false;
    var nameClient = null;

    var _ref = this;

    APP.services.socketController.addEventListener(APP.services.socketController.ON_TALK_END, function(event, data){
        if(APP.lastServiceLaunch === 'SearchModule'){
            APP.lastServiceLaunch = null;
            releaseTalk();
        }
    }, this);

    APP.services.socketController.addEventListener(APP.services.socketController.ON_TALK, function(event, data){
        //console.log('callBackTalk ' + data);

        data = data.split(',')[0];

        console.log(data);

        if(isLoading) return;

        isLoading = true;

        var nb, nb2;
        var i, j;
        var power = 0;
        var currentPower = 0;
        var words = data.split(' ');
        var index;
        var powerFullProcess;
        var flag = true;

        // remove ignore words
        nb = APP.models.CommandsModel.wordsToIgnore.length;
        for (i = 0; i < nb; i++) {
            index = words.indexOf(APP.models.CommandsModel.wordsToIgnore[i]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        if(!processLearning) {
            nb = APP.models.TalkModel.LISTENING_WORDS_TALK.length;
            nb2 = words.length;

            for (i = 0; i < nb && flag; i++) {
                currentPower = 0;
                for (j = 0; j < nb2; j++) {
                    if(APP.models.TalkModel.LISTENING_WORDS_TALK[i].keyWords.indexOf(words[j]) != -1){
                        currentPower++;
                    }
                }
                if(currentPower > power) {
                    power = currentPower;
                    powerFullProcess = APP.models.TalkModel.LISTENING_WORDS_TALK[i];
                    if(currentPower == nb2 && currentPower == APP.models.TalkModel.LISTENING_WORDS_TALK[i].keyWords.split(' ').length){
                        flag = false;
                    }
                }
            }


            nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;

            var keywords;
            var k;
            for (i = 0; i < nb && flag; i++) {
                currentPower = 0;
                for (j = 0; j < nb2; j++) {
                    keywords = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i].keyWords.split(' ');

                    for (k = 0; k < keywords.length; k++) {
                        if(keywords[k].indexOf(words[j]) != -1){
                            currentPower++;
                        }
                    }

                }
                if(APP.models.CommandsModel.LISTENING_WORDS_ACTION[i].keyWords !== '' &&
                    currentPower > power &&
                    Math.abs(nb2 - keywords.length) <= 3 ) 
                {
                    power = currentPower;
                    powerFullProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
                    if(currentPower == nb2){
                        flag = false;
                    }
                }
            }

            if(powerFullProcess) {

                if( ((APP.lastServiceLaunch === 'searchWeb' || APP.lastServiceLaunch === 'getNews') && powerFullProcess.id === 'stop') ||
                    !APP.lastServiceLaunch ||
                    (APP.lastServiceLaunch !== 'searchWeb' && APP.lastServiceLaunch !== 'getNews')) {

                    APP.services.SnowboyService.countStandBy = 0;

                    switch(powerFullProcess.type){
                        case 'execute':
                            APP.services.DispatcherCommands.run(words, powerFullProcess, APP.lastServiceLaunch).then(function(){
                                APP.lastServiceLaunch = APP.services.DispatcherCommands.lastServiceLaunch;
                                console.log('lastServiceLaunch : ' + APP.lastServiceLaunch);
                            }).catch(function(){

                            });
                            releaseTalk();
                            break;
                        case 'talk':
                            if(powerFullProcess.id == 'talk_1')
                            {
                                nameClient = null;
                                APP.services.SoundEmotionService.playSound('hello');
                            }
                            else if(powerFullProcess.id == 'talk_3')
                            {
                                APP.services.SoundEmotionService.playSound('talk');
                            }else{
                                APP.services.SoundEmotionService.playSound('talk');
                            }

                            /*if(!nameClient){
                                if(powerFullProcess.initiativesNoName){
                                    processLearning = APP.models.TalkModel.getRandomInitiative(powerFullProcess);
                                    _ref.speech(powerFullProcess.answer[0] + '. ' + APP.models.TalkModel.getQuestionsRandom(processLearning));
                                }else{
                                    _ref.speech(powerFullProcess.answer[0]);
                                }
                            }else{
                                if(powerFullProcess.initiatives){
                                    processLearning = APP.models.TalkModel.getRandomInitiative(powerFullProcess, nameClient);
                                    _ref.speech(powerFullProcess.answer[0] + '. ' + APP.models.TalkModel.getQuestionsRandom(processLearning, nameClient));
                                }else{
                                    _ref.speech(powerFullProcess.answer[0]);
                                }
                            }*/
                            releaseTalk();
                            break;
                        default:
                            APP.services.SoundEmotionService.playSound('talk');
                            releaseTalk();
                            break;
                    }
                }else{
                    releaseTalk();
                }
            }else{
                APP.services.SoundEmotionService.playSound('talk');
                releaseTalk();
            }
        }else{

            if(!confirmStep){
                confirmStep = true;
                wordToConfirm = data;
                switch (processLearning.id){
                    case 'gotName':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                    case 'gotLike':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                    case 'gotWord':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                }
                releaseTalk();
            }else{
                if(data == 'oui'){
                    switch (processLearning.id){
                        case 'gotName':
                            nameClient = wordToConfirm;
                            console.log('gotName confirmed ' + nameClient);
                            break;
                        case 'gotLike':
                            console.log('gotLike confirmed ' + data);
                            break;
                        case 'gotWord':
                            console.log('gotWord confirmed ' + data);
                            break;
                    }
                }else{
                    nameClient = null;
                }

                wordToConfirm = null;
                confirmStep = false;
                processLearning = null;

                releaseTalk();
            }


        }



    }, this);

    this.speech = function(msg){
        APP.services.socketController.talk(APP.SOCKET_MESSAGE.TALK, msg);

        var split2 = msg.split('||');
        var paramMsg = split2[0];
        var param = split2.length > 1 ? split2[1] : null;

        APP.services.DevicesService.textToSpeech(paramMsg).then(function(){
            APP.services.socketController.sendAction('textToSpeech_end', paramMsg);
        }).catch(function(){
            APP.services.socketController.sendAction('textToSpeech_end_failed', msg);
        });
    };

    var releaseTalk = function(){
        isLoading = false;
    };

    return this;
};
APP.EnterHomeCmd = (function(ref){

    var _ref = ref;
    var _this = this;

    this.execute = function(resolve, words){

        var command = new APP.WakeupSnowboyCmd(this);
        command.execute(function(){});

        var date = new Date();
        var hour = date.getHours();
        if(hour > 19 || hour < 7){
            _this.lightOn(words);
        }else{
            setTimeout(function(){
                APP.services.SoundEmotionService.playSound('hello');
                setTimeout(function(){
                    APP.services.talkServeCtrl.speech('contante de vous revoir ' + words);
                }, 500);
            }, 500);
        }

        resolve();
    }

    this.lightOn = function(words){
        var nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
        var i;
        var currentProcess;
        var cmds = [];
        for (i = 0; i < nb; i++) {
            currentProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
            if(currentProcess.id === 'light_on_entrée' ||
                currentProcess.id === 'light_on_saloon' ||
                currentProcess.id === 'light_on_bureau'
            ) {
                cmds.push(currentProcess);
            }
        }

        nb = cmds.length;

        var func = function(i, nb, words){
            setTimeout((function(i, nb, words){return function(){
                var CommandClass = APP[cmds[i].commandClasses[0]];
                command = new CommandClass(this);
                command.execute(function(){}, cmds[i]);

                if(i+1 < nb){
                    func(i+1, nb, words);
                }else{
                    setTimeout(function(){
                        APP.services.SoundEmotionService.playSound('hello');
                        setTimeout(function(){
                            APP.services.talkServeCtrl.speech('contante de vous revoir ' + words);
                        }, 500);
                    }, 500);
                }
            };})(i, nb, words), 600);
        }
        func(0, nb, words);
    }


    return this;

});
APP.LeaveHomeCmd = (function(ref){

    var _ref = ref;
    var _this = this;

    this.execute = function(resolve, words){

        var command = new APP.StandbySnowboyCmd(this);
        command.execute(function(){});

        var date = new Date();
        var hour = date.getHours();

        APP.services.SoundEmotionService.playSound('sad');
        setTimeout(function(){
            APP.services.talkServeCtrl.speech('A bientôt ' + words);
            setTimeout(function(){
                _this.devicesOff(words, hour > 19 || hour < 7);
            }, 500);
        }, 500);

        resolve();
    }
    this.devicesOff = function(words, lights){
        var nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
        var i;
        var currentProcess;
        var cmds = [];
        for (i = 0; i < nb; i++) {
            currentProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
            if((lights && (currentProcess.id === 'light_off_entrée' ||
                currentProcess.id === 'light_off_saloon' ||
                currentProcess.id === 'light_off_bureau')) ||
                currentProcess.id === 'son_off_télé'
            ) {
                cmds.push(currentProcess);
            }
        }

        nb = cmds.length;
        var func = function(i, nb, words){
            setTimeout((function(i, nb, words){return function(){
                var CommandClass = APP[cmds[i].commandClasses[0]];
                command = new CommandClass(this);
                command.execute(function(){}, cmds[i]);

                if(i+1 < nb){
                    func(i+1, nb, words);
                }
            };})(i, nb, words), 600);
        }
        func(0, nb, words);
    }

    return this;

});
APP.CameraOffCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.cameraOff();
        resolve();
    }


    return this;

});
APP.CameraOnCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.cameraOn();
        resolve();
    }


    return this;

});
APP.DownVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.downVolume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.GetDateCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        setTimeout(function(){
            APP.services.talkServeCtrl.speech(APP.services.DevicesService.getDate());
            resolve();
        }, 1000);
    }


    return this;

});
APP.GetTimeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        setTimeout(function(){
            APP.services.talkServeCtrl.speech(APP.services.DevicesService.getTime());
            resolve();
        }, 1000);
    }


    return this;

});
APP.UpVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.upVolume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.ForwindMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.forwind();
        resolve();
    }


    return this;

});
APP.GetTitleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.talkServeCtrl.speech('Lecture en cours. ' + APP.services.MusicService.getCurrentTitle());
        resolve();
    }


    return this;

});
APP.NextMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.next();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.NoShuffleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.noshuffle();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PauseMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.pause();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PlayAllMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.lastServiceLaunch = 'MusicModule';
        APP.services.MusicService.playAll();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PrevMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.prev();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.ResumeMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.resume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.SearchMHardDriveCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve, powerFullProcess, words){

        var searchValue;
        // remove ignore words
        var ignore = powerFullProcess.keyWords.split(' ');
        var nb = ignore.length;
        var i;
        var index;
        for (i = 0; i < nb; i++) {
            index = words.indexOf(ignore[i]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        searchValue = words;

        console.log('SearchMHardDriveCmd : ' + searchValue);
        if(searchValue.length === 0) {
            var command = new APP.PlayAllMHardDriveCmd(_ref);
            command.execute(resolve, powerFullProcess, words);
            return;
        }

        var funcSearch = function(){
            APP.services.MusicService.search(searchValue).then(function(result){
                if(result && result.length == 0){
                    APP.services.SoundEmotionService.playSound('sad');
                    APP.services.talkServeCtrl.speech('Aucun résultats');
                }else{
                    _ref.lastServiceLaunch = 'MusicModule';
                    APP.services.MusicService.playList(result);
                    APP.services.SoundEmotionService.playSound('happy');
                    //_ref.talkController.speech('Lecture en cours. ' + APP.MusicService.getCurrentTitle());
                }
                resolve();
            });
        };

        if(APP.services.MusicService.networkLibPath.length > 0){
            if(!APP.services.MusicService.networkLibLoaded) {
                APP.services.MusicService.checkNetwork().then(function () {
                    APP.services.MusicService.getListNetworkMusic().then(function () {
                        APP.services.MusicService.networkAvailable = true;
                        APP.services.MusicService.networkLibLoaded = true;
                        funcSearch();
                    }).catch(function () {
                        APP.services.MusicService.networkAvailable = false;
                        APP.services.MusicService.networkLibLoaded = false;
                        funcSearch();
                    })
                }).catch(function () {
                    APP.services.MusicService.networkAvailable = false;
                    funcSearch();
                });


            }else{
                APP.services.MusicService.checkNetwork().then(function () {
                    APP.services.MusicService.networkAvailable = true;
                    funcSearch();
                }).catch(function () {
                    APP.services.MusicService.networkAvailable = false;
                    funcSearch();
                });
            }
        }else{
            APP.services.MusicService.networkAvailable = false;
            funcSearch();
        }
    }

    return this;

});
APP.ShuffleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.shuffle();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.StopMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.stop();
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
APP.TurnArroundRobotCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        if(APP.services.RobotDAO.disabled){
            resolve();
            return;
        }

        APP.services.SoundEmotionService.playSound('talk');
        APP.services.RobotDAO.rotateLeft();
        setTimeout(function(){
          APP.services.RobotDAO.stop();
        }, 1000);
        resolve();
    }


    return this;

});
APP.GetNewsCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.SearchService.getNews().then(function(result){
            var titles = '';
            var i, nb ;
            nb = result.length;
            for(var i = 0; i < nb; i++) {
              titles += result[i].title + '. ';
            }
            _ref.lastServiceLaunch = 'SearchModule';
            APP.services.talkServeCtrl.speech('Titre à la une. ' + titles + '||true');
            resolve();
        }).catch(function(){
            APP.services.SoundEmotionService.playSound('sad');
            resolve();
        });
    }


    return this;

});
APP.SearchOnWebCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words){
        runSearchWeb(powerFullProcess, words, resolve);
    }

    function runSearchWeb(powerFullProcess, words, resolve) {
        APP.services.SoundEmotionService.playSound('happy');
        var searchValue;
        var wordsToIgnore = 'les le la un une des est qui qu\'est-ce que'.split(' ');

        // remove ignore words
        var ignore = powerFullProcess.keyWords.split(' ');
        var nb;
        var j;
        var index;

        var ignore2 = ignore[0].split('||').concat(wordsToIgnore);
        nb = ignore2.length;
        for (j = 0; j < nb; j++) {
            index = words.indexOf(ignore2[j]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        searchValue = words;

        APP.services.SearchService.search(searchValue).then(function(result){
            console.log(result);

            if(result.length > 0){
                _ref.lastServiceLaunch = 'SearchModule';
                APP.services.talkServeCtrl.speech(result[0].text + '||true');
                resolve()
            }else{
                APP.services.SoundEmotionService.playSound('sad');
                APP.services.talkServeCtrl.speech('Aucun résultats');
                resolve();
            }
        }).catch(function(error){
            console.log('error ' + error);
            APP.services.SoundEmotionService.playSound('sad');
            APP.services.talkServeCtrl.speech('Aucun résultats');
            resolve();
        });

    };

    return this;

});
APP.ExecuteCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch, sound){
        APP.services.DevicesService.execute(powerFullProcess.cmd).then(function(){

            if(powerFullProcess.cmd.indexOf('mocp')){
                _ref.lastServiceLaunch = 'MusicModule';
            }
            if(sound){
                APP.services.SoundEmotionService.playSound('talk');
            }

            if(powerFullProcess.successAnswer){
                //_ref.talkController.speech(powerFullProcess.successAnswer);
            }

            resolve();
        }, function() {
            resolve();
        });
    }


    return this;

});
APP.StandbySnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SnowboyService.start();
        resolve();
    }


    return this;

});
APP.WakeupSnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SnowboyService.stop();
        resolve();
    }


    return this;

});
APP.GetTitleSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_gettitle', 'soundcloud_gettitle');
        resolve();
    }


    return this;

});
APP.NextSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_next', 'soundcloud_next');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PrevSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_prev', 'soundcloud_prev');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.RandomSoundcloudCmd = (function(dispatcherCmds){

    var _dispatcherCmds = dispatcherCmds;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_random', 'soundcloud_random');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.SearchOnSoundCloudCmd = (function(dispatcherCmds){

    var _dispatcherCmds = dispatcherCmds;
    var _this = this;

    this.execute = function(resolve, powerFullProcess, words){

        APP.services.socketController.addEventListener(APP.services.socketController.ON_ACTION, function (event, type, data) {

            if( data == '') return;

            switch(type){
                case 'soundcloud_searchsuccess':
                    _dispatcherCmds.lastServiceLaunch = 'SoundcloudModule';
                    resolve();
                    break;
                case 'soundcloud_searcherror':
                    APP.services.SoundEmotionService.playSound('sad');
                    APP.services.talkServeCtrl.speech('Aucun résultats');
                    resolve();
                    break;
                case 'soundcloud_onplay':
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + data);
                    break;
                case 'soundcloud_onplayerror':
                    resolve();
                    break;
                case 'soundcloud_ontitle':
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + data);
                    break;
            }
        }, _this);

        runSoundcloud(powerFullProcess, words, resolve);
    }

    function runSoundcloud(powerFullProcess, words, resolve){
        APP.services.SoundEmotionService.playSound('happy');

        var searchValue;
        if(powerFullProcess.userTracks){
            searchValue = powerFullProcess.userTracks;
        }else{
            // remove ignore words
            var ignore = powerFullProcess.keyWords.split(' ');
            var nb = ignore.length;
            var i;
            var index;
            for (i = 0; i < nb; i++) {
                index = words.indexOf(ignore[i]);
                if(index != -1){
                    words.splice(index, 1);
                }
            }

            searchValue = words;
        }

        APP.services.socketController.sendAction('soundcloud_search', searchValue);

    };

    return this;

});
APP.StopSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_stop', 'soundcloud_stop');
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
APP.StopTalkCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        console.log('StopTalkCmd');
        APP.services.DevicesService.stopTalk();
        APP.services.socketController.sendAction('stopTalk', 'stopTalk');
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
APP.GetTemperatureExtCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.TemperatureService.getTemperature().then(function(result){
            APP.services.talkServeCtrl.speech(result.ext + ' degrés.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
APP.GetTemperatureIntCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.TemperatureService.getTemperature().then(function(result){
            APP.services.talkServeCtrl.speech(result.int + ' degrés.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
APP.GetTemperaturesCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.TemperatureService.getTemperature().then(function(result){
            console.log('ext : ' + result.ext);
            console.log('int : ' + result.int);
            APP.services.talkServeCtrl.speech('Il fait ' + (result.ext < 0 ? 'moins ' + Math.abs(result.ext) : result.ext) + ' degrés à lextérieur. Et ' + (result.int < 0 ? 'moins ' + Math.abs(result.int) : result.int) + ' degrés à linterieur.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
APP.NextVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.execute(['mocp -f']).then(function(){
            resolve();
        }).catch(function(){
            resolve();
        });
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PrevVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.execute(['mocp -r']).then(function(){
            resolve();
        }).catch(function(){
            resolve();
        });
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.StopVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.execute(['mocp -s']).then(function(){
        });
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
APP.NextYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.nextVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.PrevYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.prevVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.RandomYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.randomVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
APP.SearchOnYoutubeCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve, powerFullProcess, words){
        runYoutube(powerFullProcess, words, resolve);
    }

    function runYoutube(powerFullProcess, words, resolve){
        APP.services.SoundEmotionService.playSound('happy');

        var searchValue;
        if(powerFullProcess.playlist){
            searchValue = powerFullProcess.playlist;
        }else{
            // remove ignore words
            var ignore = powerFullProcess.keyWords.split(' ');
            var nb = ignore.length;
            var i;
            var index;
            for (i = 0; i < nb; i++) {
                index = words.indexOf(ignore[i]);
                if(index != -1){
                    words.splice(index, 1);
                }
            }

            searchValue = words;
        }

        //_ref.socketController.sendAction('youtube', searchValue);

        APP.services.YoutubeService.search(searchValue).then(function(result){
            console.log(result);
            var split2 = result.split('---');
            var tab = [];

            for (var i = 0; i < split2.length; i++) {
                var tempSplit = split2[i].split('||');

                tab.push({
                    url: tempSplit[0],
                    title: tempSplit[1]
                })
            }
            if(powerFullProcess.playlist){
                tab.unshift({
                    url: powerFullProcess.playlist_watch + '1',
                    title: powerFullProcess.playlist_title
                })
            }
            if(tab.length > 0){
                _ref.lastServiceLaunch = 'YoutubeModule';
                APP.services.VideoService.setListVideos(tab);
                APP.services.VideoService.play().then(function(title){
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + title);
                    resolve();
                }).catch(function(){
                    resolve();
                });
            }else{
                APP.services.SoundEmotionService.playSound('sad');
                APP.services.talkServeCtrl.speech('Aucun résultats');
                resolve();
            }
        }).catch(function(error){
            console.log('error ' + error);
            APP.services.talkServeCtrl.speech('Aucun résultats');
            APP.services.SoundEmotionService.playSound('sad');
            resolve();
        });
    };

    return this;

});
APP.StopYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.closeVideo();
        _ref.lastServiceLaunch = null;
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
var fs = require('fs');

APP.BaseModule = (function(){

    var _ref = this;

    var intervalClient = -1;
    var countIntervalLimit = 6*60; // 1 hour
    var currentCountInterval = 0;

    this.init = function(homepageServer){

        APP.lastServiceLaunch = null;

        APP.models.CommandsModel = new APP.CommandsModel();
        APP.models.CommandsModel.LISTENING_WORDS_ACTION = APP.commandsJSON;

        APP.models.TalkModel = new APP.TalkModel();

        APP.services.SoundEmotionService = new APP.SoundEmotionService();
        APP.services.DevicesService = new APP.DevicesService();
        APP.services.BddDAO = new APP.BddMongoDAO();

        // Controller Socket
        APP.services.socketController = new APP.SocketController(homepageServer);

        // Controller Interactions Person
        APP.services.talkServeCtrl = new APP.TalkServeCtrl();

        APP.services.SnowboyService = new APP.SnowboyService();
        APP.services.DispatcherCommands = new APP.DispatcherCommands();


        APP.services.DevicesService.startClient();

        intervalClient = setInterval(function(){
            currentCountInterval++;
            if(currentCountInterval >= countIntervalLimit) {
                APP.services.DevicesService.restartClient();
                currentCountInterval = 0;
            }
        }, 10000);
    }


    return this;

});
var fs = require('fs');

APP.MusicModule = (function(){

    this.init = function(){
        APP.services.MusicService = new APP.MusicService();

        APP.services.MusicService.networkLibPath = APP.configJSON.musicModule.networkPath;

        var nb = APP.configJSON.musicModule.path.length;
        var  i = 0;
        for(i = 0; i < nb; i++) {
            APP.services.MusicService.getListMusic(APP.configJSON.musicModule.path[i]);
        }
    }


    return this;

});
APP.RobotModule = (function(){

    var _ref = this;

    this.init = function(){

        APP.services.RobotDAO = new APP.RobotDAO();
        //APP.services.TestRobot = new APP.TestRobot();

        if(APP.services.RobotDAO.disabled) {
            return;
        }

        APP.services.socketController.addEventListener(APP.services.socketController.ON_CLIENT_CONNECT, function(){
            APP.services.socketController.sendInfos(APP.SOCKET_MESSAGE.VOLTAGE_CHANGE, APP.services.RobotDAO.getVoltage());
        }, _ref);

        APP.services.RobotDAO.addEventListener(APP.services.RobotDAO.ON_INIT, function(){
            APP.services.socketController.sendInfos(APP.SOCKET_MESSAGE.VOLTAGE_CHANGE, APP.services.RobotDAO.getVoltage());
        }, _ref);

        APP.services.RobotDAO.addEventListener(APP.services.RobotDAO.ON_INFO, function(event, type){
            switch (type){
                case APP.SOCKET_MESSAGE.VOLTAGE_CHANGE:
                case APP.SOCKET_MESSAGE.VOLTAGE_LOW:
                case APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL:
                case APP.SOCKET_MESSAGE.VOLTAGE_NORMAL:
                    APP.services.socketController.sendInfos(type, APP.services.RobotDAO.getVoltage());
                    break;
            }
        }, _ref);

        // Listen socket motion
        APP.services.socketController.addEventListener(APP.services.socketController.ON_ANALOG_CHANGE, function(event, data){
            if(APP.services.RobotDAO.disabled){
                return;
            }

            sendRobotPad(data);
        }, this);

        APP.services.socketController.addEventListener(APP.services.socketController.ON_PAD_CHANGE, function(event, type){

            if(APP.services.RobotDAO.disabled){
                return;
            }

            switch(type){
                case APP.SOCKET_MESSAGE.UP:
                    APP.services.RobotDAO.fwd();
                    break;
                case APP.SOCKET_MESSAGE.DOWN:
                    APP.services.RobotDAO.backward();
                    break;
                case APP.SOCKET_MESSAGE.LEFT:
                    APP.services.RobotDAO.rotateLeft();
                    break;
                case APP.SOCKET_MESSAGE.RIGHT:
                    APP.services.RobotDAO.rotateRight();
                    break;
                case APP.SOCKET_MESSAGE.STOP:
                    APP.services.RobotDAO.stop();
                    break;
            }

        }, this);

    }

    function sendRobotPad(data){

        var split = data.split(',');

        this.percentX = parseFloat(split[0]);
        this.percentY = parseFloat(split[1]);

        this.fwd = this.percentY < 0;
        this.speedMotors = Math.ceil(Math.sqrt(Math.pow(Math.abs(this.percentX), 2) + Math.pow(Math.abs(this.percentY), 2)) / 0.5 * 255);

        if(Math.abs(this.percentX) > 0.1){
            if(this.percentX > 0){
                this.speedMotorLeft = this.speedMotors;
                this.speedMotorRight = Math.ceil(this.speedMotors  * ( 1 - (this.percentX/0.5)));
            }else{
                this.speedMotorRight = this.speedMotors;
                this.speedMotorLeft = Math.ceil(this.speedMotors  * ( 1 - (-this.percentX/0.5)));
            }
        }else{
            this.speedMotorRight = this.speedMotors;
            this.speedMotorLeft = this.speedMotors;
        }


        console.log('speedMotorLeft ' + this.speedMotorLeft);
        console.log('speedMotorRight ' + this.speedMotorRight);
        console.log('this.fwd ' + this.fwd);

        if(APP.services.RobotDAO.speedsMotors){
            APP.services.RobotDAO.speedsMotors(this.fwd, this.speedMotorLeft, this.speedMotorRight );
        }
    }

    return this;

});
APP.SearchModule = (function(){

    var _ref = this;

    this.init = function(){
        APP.services.SearchService = new APP.SearchService();
    }

    return this;

});
APP.SoundcloudModule = (function(){

    var _ref = this;

    this.init = function(){


    }

    return this;

});
APP.TemperatureModule = (function(){

    var lastTemperature = {ext: 15, int: 19};
    var _ref = this;

    this.init = function(){

        // start check temperature
        APP.services.TemperatureService = new APP.TemperatureService();
        APP.services.TemperatureService.startCheckTemperature();
        APP.services.TemperatureService.addEventListener(APP.services.TemperatureService.ON_CHECK_TEMPERATURE, callBackCheck, _ref);

    }

    function callBackCheck(event, result) {
        var str = 'Il fait ' + (result.ext < 0 ? 'moins ' + Math.abs(result.ext) : result.ext) + ' degrés à lextérieur. Et ' + (result.int < 0 ? 'moins ' + Math.abs(result.int) : result.int) + ' degrés à linterieur.';
        var flag = false;

        // ext
        if(result.ext < -1 && lastTemperature.ext >= -1){
            str += ' Couvrez vous bien si vous sortez !';
            flag = true;
        }
        else if(result.ext < -5 && lastTemperature.ext >= -5){
            str += ' Couvrez vous bien si vous sortez !';
            flag = true;
        }
        else if(result.ext > 30 && lastTemperature.ext <= 30){
            str += ' Pensez à vous hydrater !';
            flag = true;
        }
        else if(result.ext > 35 && lastTemperature.ext <= 35){
            str += ' Pensez à vous hydrater !';
            flag = true;
        }

        // int
        if(result.int < 17 && lastTemperature.int >= 17){
            str = 'La température est anormalement basse dans le salon. ' + str;
            flag = true;
        }

        if(flag){
            APP.services.talkServeCtrl.speech(str);
        }

        lastTemperature.ext = result.ext;
        lastTemperature.int = result.int;
    }

    return this;

});
APP.YoutubeModule = (function(){

    var _ref = this;

    this.init = function(){
        APP.services.VideoService = new APP.VideoService();
        APP.services.YoutubeService = new APP.YoutubeService();
    }

    return this;

});
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
