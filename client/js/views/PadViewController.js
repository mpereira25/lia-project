APP.PadViewController = function(view, socketController) {

    view.onStop =  function(){
        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.STOP, "");
    };
    view.onUp =  function(){
        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.UP);
    };
    view.onDown =  function(){
        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.DOWN);
    };
    view.onRight =  function(){
        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.RIGHT);
    };
    view.onLeft =  function(){
        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.LEFT);
    };

    return this;
};