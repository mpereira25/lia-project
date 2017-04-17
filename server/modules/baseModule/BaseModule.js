APP.BaseModule = (function(){

    this.socketController;
    this.talkServeCtrl;

    var _ref = this;

    this.init = function(homepageServer){

        APP.services = {};
        APP.cmd = {};

        APP.services.RobotModel = new APP.RobotModel();
        APP.services.BddDAO = new APP.BddMongoDAO();
        APP.services.RobotDAO = new APP.RobotDAO();
        //APP.services.TestRobot = new APP.TestRobot();

        // Controller Socket
        this.socketController = new APP.SocketController(homepageServer);

        // Controller Interactions Person
        this.talkServeCtrl = new APP.TalkServeCtrl(this.socketController);

        APP.services.SnowboyService = new APP.SnowboyService(this.socketController, this.talkServeCtrl);
        APP.services.DispatcherCommands = new APP.DispatcherCommands(this.socketController, this.talkServeCtrl);


        // listen clients
        this.socketController.addEventListener(this.socketController.ON_TALK, function(){
            if(APP.services.RobotDAO.getVoltage){
                APP.services.RobotDAO.callBacksInit = function(){
                    _ref.socketController.sendInfos(APP.SOCKET_MESSAGE.VOLTAGE_CHANGE, APP.services.RobotDAO.getVoltage());
                };
                APP.services.RobotDAO.callBacks = function(type){
                    switch (type){
                        case APP.SOCKET_MESSAGE.VOLTAGE_CHANGE:
                        case APP.SOCKET_MESSAGE.VOLTAGE_LOW:
                        case APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL:
                        case APP.SOCKET_MESSAGE.VOLTAGE_NORMAL:
                            _ref.socketController.sendInfos(type, APP.services.RobotDAO.getVoltage());
                            break;
                    }
                };
                _ref.socketController.sendInfos(APP.SOCKET_MESSAGE.VOLTAGE_CHANGE, APP.services.RobotDAO.getVoltage());
            }else{
                _ref.socketController.sendInfos(APP.SOCKET_MESSAGE.VOLTAGE_CHANGE, '0');
            }
        }, this);


        // Listen socket motion
        this.socketController.addEventListener(this.socketController.ON_ANALOG_CHANGE, function(event, data){
            if(APP.services.RobotDAO.disabled){
                return;
            }

            sendRobotPad(data);
        }, this);

        this.socketController.addEventListener(this.socketController.ON_PAD_CHANGE, function(event, type){

            if(APP.services.RobotDAO.disabled){
                return;
            }

            switch(type){
                case APP.SOCKET_MESSAGE.UP:
                    APP.services.RobotDAO.fwd();
                    break;
                case APP.SOCKET_MESSAGE.DOWN:
                    APP.services.RobotDAO.backward();
                    break;
                case APP.SOCKET_MESSAGE.LEFT:
                    APP.services.RobotDAO.rotateLeft();
                    break;
                case APP.SOCKET_MESSAGE.RIGHT:
                    APP.services.RobotDAO.rotateRight();
                    break;
                case APP.SOCKET_MESSAGE.STOP:
                    APP.services.RobotDAO.stop();
                    break;
            }

        }, this);

    }

    function sendRobotPad(data){

        var split = data.split(',');

        this.percentX = parseFloat(split[0]);
        this.percentY = parseFloat(split[1]);

        this.fwd = this.percentY < 0;
        this.speedMotors = Math.ceil(Math.sqrt(Math.pow(Math.abs(this.percentX), 2) + Math.pow(Math.abs(this.percentY), 2)) / 0.5 * 255);

        if(Math.abs(this.percentX) > 0.1){
            if(this.percentX > 0){
                this.speedMotorLeft = this.speedMotors;
                this.speedMotorRight = Math.ceil(this.speedMotors  * ( 1 - (this.percentX/0.5)));
            }else{
                this.speedMotorRight = this.speedMotors;
                this.speedMotorLeft = Math.ceil(this.speedMotors  * ( 1 - (-this.percentX/0.5)));
            }
        }else{
            this.speedMotorRight = this.speedMotors;
            this.speedMotorLeft = this.speedMotors;
        }


        console.log('speedMotorLeft ' + this.speedMotorLeft);
        console.log('speedMotorRight ' + this.speedMotorRight);
        console.log('this.fwd ' + this.fwd);

        if(APP.services.RobotDAO.speedsMotors){
            APP.services.RobotDAO.speedsMotors(this.fwd, this.speedMotorLeft, this.speedMotorRight );
        }
    }

    return this;

});