APP.NavViewController = function(view, headViewController, talkController, socketController){


    socketController.action('get_listen_state', 'get_listen_state');

    view.onStartHead = function(){
        headViewController.start();
    };
    view.onClickTalk = function(){
        talkController.alwaysListening = false;
        talkController.start();
    };
    view.onClickWrite = function(){

    };
    view.onClickListen = function(){
        socketController.action('listen_switch', 'listen_switch');
    };
    view.onClickHalt = function(){
        socketController.action('halt', 'halt');
    };
    return this;

};