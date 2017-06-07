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
