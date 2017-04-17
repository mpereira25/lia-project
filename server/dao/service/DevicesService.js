var RSVP = require('rsvp');
var EventBus = require('eventbusjs');

APP.DevicesService = (function(){
    this.ON_CHECK_TEMPERATURE = 'DevicesService.ON_CHECK_TEMPERATURE';

    var _ref = this;
    var _isInit = false;
    var _indexWav = 0;
    var _intervalTemperature = 0;
    var _timeCheckTemperature = 10; // minutes
    var _countInterval = 0;

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

    this.getTemperature = function(){

        if(!_isInit) _ref.init();

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
        _textToSpeechWav.stop();
        var childRemove = exec('rm pico2wave/rec' + _indexWav + '.wav');
        if(_resolveTextToSpeech){
            _resolveTextToSpeech();
            _resolveTextToSpeech = null;
        }

    }

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
    return this;

})();
