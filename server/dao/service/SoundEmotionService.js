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

        var url = _dict[id][Math.round(Math.random() * (_dict[id].length-1))];

        var sound = new Sound(url);
        sound.on('complete', function () {

        });
        sound.play();
    };

    return this;

});
