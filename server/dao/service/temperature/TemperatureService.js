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
