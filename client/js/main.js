APP.init = function(){

    APP.services = {};

};
APP.start = function(){


    APP.socketController = new APP.SocketController();
    var touchController = new APP.TouchController();
    APP.talkController = new APP.TalkController(APP.socketController);

    APP.services.SoundcloudService = new APP.SoundcloudService();
    APP.services.SoundcloudService.init();

    APP.socketController.connect();

    // VIEWS and controllers
    var navView = new APP.NavView($('.nav'));
    var headView = new APP.HeadLedsView2($('.headDiv'));
    var boardView = new APP.BoardView($('.board'));
    //var padAnalogView = new APP.PadAnalogView($('.analog'), socketController, touchController);
    var padView = new APP.PadView($('.pad'), touchController);

    var headViewController = new APP.HeadLedsView2Controller(headView, APP.talkController);
    var navViewController = new APP.NavViewController(navView, headViewController, APP.talkController, APP.socketController);
    var boardViewController = new APP.BoardViewController(boardView, APP.socketController);
    var padViewController = new APP.PadViewController(padView, APP.socketController);

    // LISTEN SOCKET
    APP.socketController.addEventListener(APP.socketController.ON_ACTION, function(event, type, param){

        switch(type){
            case "listen_on":
                APP.talkController.alwaysListening = true;
                APP.talkController.start();
                navView.listen(true);
                break;
            case "listen_off":
                APP.talkController.alwaysListening = false;
                APP.talkController.stop();
                navView.listen(false);
                break;
            case "start_listening":
                APP.talkController.alwaysListening = true;
                navView.listen(true);
                break;
            case "textToSpeech_end":
                if( APP.talkController.alwaysListening){
                    APP.talkController.start();
                }
                APP.socketController.talk(APP.SOCKET_MESSAGE.TALK_END, 'TALK_END');
                break;
            case "textToSpeech_end_failed":
                var split2 = param.split('||');
                var msg = split2[0];
                var param2 = split2.length > 1 ? split2[1] : null;

                var dontStopListening = false;
                if(param2 && param2 === 'true') {
                    dontStopListening = true;
                }
                APP.talkController.speech(msg, dontStopListening);
                break;
            case "stopTalk":
                APP.talkController.stopSpeech();
                break;
            case "soundcloud_search":
                APP.services.SoundcloudService.search(param).then(function(result){
                    console.log(result);
                    if(result && result.length > 0){
                        APP.socketController.action('soundcloud_searchsuccess', 'soundcloud_searchsuccess');
                        APP.services.SoundcloudService.play().then(function(track){
                            APP.socketController.action('soundcloud_onplay', track.title);
                        }).catch(function(){
                            APP.socketController.action('soundcloud_onplayerror', 'soundcloud_onplayerror');
                        });
                    }else{
                        APP.socketController.action('soundcloud_searcherror', 'soundcloud_searcherror');
                    }
                }).catch(function(error){
                    console.log('error ' + error);
                    APP.socketController.action('soundcloud_searcherror', 'soundcloud_searcherror');
                });
                break;
            case "soundcloud_stop":
                APP.services.SoundcloudService.stop();
                break;
            case "soundcloud_random":
                APP.services.SoundcloudService.random().then(function(track){
                    APP.socketController.action('soundcloud_onplay', track.title);
                }).catch(function(){
                    APP.socketController.action('soundcloud_onplayerror', 'soundcloud_onplayerror');
                });;
                break;
            case "soundcloud_prev":
                APP.services.SoundcloudService.prev().then(function(track){
                    APP.socketController.action('soundcloud_onplay', track.title);
                }).catch(function(){
                    APP.socketController.action('soundcloud_onplayerror', 'soundcloud_onplayerror');
                });
                break;
            case "soundcloud_next":
                APP.services.SoundcloudService.next().then(function(track){
                    APP.socketController.action('soundcloud_onplay', track.title);
                }).catch(function(){
                    APP.socketController.action('soundcloud_onplayerror', 'soundcloud_onplayerror');
                });
                break;
            case "soundcloud_gettitle":
                APP.socketController.action('soundcloud_ontitle', APP.services.SoundcloudService.getCurrentTitle());
                break;
        }
    }, this);
};

APP.talk = function(value){

    APP.talkController.talk(value);

};

APP.init();
APP.start();
