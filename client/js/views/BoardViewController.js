APP.BoardViewController = function(view, socketController){


    var _ref = this;

    // LISTEN SOCKET
    socketController.addEventListener(socketController.ON_INFO, function(event, type, param){

        var split = param.split(',');

        switch(type){
            case APP.SOCKET_MESSAGE.VOLTAGE_CHANGE:
                view.changeVoltage(parseFloat(split[0]));
                break;
            case APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL:
                view.changeVoltageCritical(parseFloat(split[0]));
                break;
            case APP.SOCKET_MESSAGE.VOLTAGE_LOW:
                view.changeVoltageLow(parseFloat(split[0]));
                break;
            case APP.SOCKET_MESSAGE.VOLTAGE_NORMAL:
                view.changeVoltageNormal(parseFloat(split[0]));
                break;
        }
    }, _ref);

    return this;
};
