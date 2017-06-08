APP.SocketController = function(){
    this.ON_TALK = 'SocketController.ON_TALK';
    this.ON_ACTION = 'SocketController.ON_ACTION';
    this.ON_INFO = 'SocketController.ON_INFO';

    var _ref = this;
    var socket;

    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    this.talk = function(type, data){
        socket.emit('talk', type + "::" + data);
    };
    this.motion = function(type, data){
        socket.emit('motion', type + "::" + data);
    };
    this.action = function(type, data){
        socket.emit('lia_action', type + "::" + data);
    };
    this.connect = function(){
        var serverUrl = 'https://' + window.location.hostname + ':' + APP.configJson.hosts.socket.port;
        socket = io.connect(serverUrl);

        socket.on('talk', function (message) {
            if(message){
                //console.log('Socket receive : ' + message);
                //alert('Socket receive : ' + message);

                var split = message.split('::');
                var type = split[0];

                var split2 = split[1].split('||');
                var msg = split2[0];
                var param = split2.length > 1 ? split2[1] : null;

                switch(type){
                    case APP.SOCKET_MESSAGE.TALK:
                        EventBus.dispatch(_ref.ON_TALK, _ref, msg, param);
                        break;
                }
            }
        });
        socket.on('infos', function (message) {
            //console.log('Socket receive : ' + message);

            var split = message.split('::');
            var type = split[0];

            switch(type){
                case APP.SOCKET_MESSAGE.VOLTAGE_CHANGE:
                case APP.SOCKET_MESSAGE.VOLTAGE_LOW:
                case APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL:
                case APP.SOCKET_MESSAGE.VOLTAGE_NORMAL:
                    EventBus.dispatch(_ref.ON_INFO, _ref, type, split[1]);
                    break;
            }
        });
        socket.on('lia_action', function (message) {
            console.log('Socket receive : ' + message);

            var split = message.split('::');
            var type = split[0];

            switch(type){
                case 'youtube':
                    var youtubeService = new APP.YoutubeService();
                    youtubeService.search(split[1].split(',')).then(function(result){
                        console.log(result);
                        _ref.action('youtube', result);
                    }).catch(function(error){
                        console.log(error);
                    });
                    break;
            }

            EventBus.dispatch(_ref.ON_ACTION, _ref, type, split[1]);
        });
    };

    return this;
};
