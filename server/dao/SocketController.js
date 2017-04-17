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

        if(APP.services.RobotModel.islistening){
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
                case 'youtube':

                    var split2 = split[1].split('---');
                    var tab = [];
                    for (var i = 0; i < split2.length; i++) {
                        var tempSplit = split2[i].split('||');
                        tab.push({
                            urlVideo: tempSplit[0],
                            title: tempSplit[1]
                        })
                    }

                    APP.VideoService.setListVideos(tab);
                    APP.VideoService.play();
                    break;
                case 'listen_switch':
                    APP.services.RobotModel.islistening = !APP.services.RobotModel.islistening;

                    if(APP.services.RobotModel.islistening){
                        APP.services.SnowboyService.stop();
                        _ref.sendAction('listen_on', 'listen_on');
                        APP.SoundEmotionService.playSound('hello');
                    }else{
                        _ref.sendAction('listen_off', 'listen_off');
                        APP.SoundEmotionService.playSound('sad');
                        setTimeout(function(){
                            APP.services.SnowboyService.start();
                        }, 1500);
                    }

                    break;
                case 'get_listen_state':
                    if(APP.services.RobotModel.islistening){
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
                    APP.SoundEmotionService.playSound('sad');
                    APP.DevicesService.halt();
                    break;

                case 'reboot':
                    _ref.talkController.speech('Reboot');
                    APP.DevicesService.reboot();
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
