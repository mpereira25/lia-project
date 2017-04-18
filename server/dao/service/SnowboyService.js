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
    var _ref = this;

    var timeoutStandBy = -1;
    this.countStandBy = 0;
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
            file: 'snowboy.umdl',
            sensitivity: '0.8',
            hotwords : 'snowboy'
        });


    }

    this.start = function(){
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
            _ref.stop();

            APP.services.CommandsModel.islistening = true;
            APP.services.socketController.sendAction('listen_on', 'listen_on');
            //APP.services.talkServeCtrl.speech('Oui ?');
            APP.services.SoundEmotionService.playSound('hello');

            _ref.countStandBy = 0;
            _ref.timeoutStandBy = setInterval(function(){
                _ref.countStandBy++;

                if(_ref.countStandBy >= 20){
                    clearInterval(_ref.timeoutStandBy);
                    APP.services.socketController.sendAction('listen_off', 'listen_off');
                    APP.services.SoundEmotionService.playSound('sad');
                    setTimeout(function(){
                        APP.services.SnowboyService.start();
                    }, 500);
                }
            }, 1000);

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

    this.stop = function(){
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
