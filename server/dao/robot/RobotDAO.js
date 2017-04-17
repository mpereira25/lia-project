APP.RobotDAO = function(){
    this.callBacks;
    this.callBacksInit;
    this.disabled = false;

    var _ref = this;
    var fs = require('fs');
    var isRun = false;

    var speedBoth = 0;
    var speedLeft = 0;
    var speedRight = 0;

    var timeoutSpeedLeft = -1;
    var timeoutSpeedRight = -1;
    var timeoutStop = -1;
    var timeoutStart = -1;
    var timeoutSpeedValue = 100;
    var timeoutStopValue = 1000;
    var isMove = false;

    var Gopigo;

    try {
        Gopigo = require('node-gopigo').Gopigo;
    }catch(e) {
        this.disabled = true;
        return;
    }

    var Commands = Gopigo.commands;
    var Robot = Gopigo.robot
    var robot
    var readline = require('readline');

    var rl = readline.createInterface({
        input : process.stdin,
        output: process.stdout
    });

    //var ultrasonicPin = 15
    //var irreceiverPin = 8

    console.log(' Welcome to the GoPiGo test application             ')
    console.log(' When asked, insert a command to test your GoPiGo   ')
    console.log(' (!) For a complete list of commands, please type help')

    robot = new Robot({
        minVoltage: 5.5,
        criticalVoltage: 5.5,
        debug: true
        //ultrasonicSensorPin: ultrasonicPin,
        //IRReceiverSensorPin: irreceiverP
    });
    robot.on('init', function onInit(res) {
        if (res) {
            console.log('GoPiGo Ready!');
            robot.motion.disableCommunicationTimeout();
            robot.encoders.disable();
        } else {
            console.log('Something went wrong during the init.')
        }
    });
    robot.on('error', function onError(err) {
        console.log('Something went wrong')
        console.log(err)
    });
    robot.on('free', function onFree() {
        console.log('GoPiGo is free to go')
    });
    robot.on('halt', function onHalt() {
        console.log('GoPiGo is halted')
    });
    robot.on('close', function onClose() {
        console.log('GoPiGo is going to sleep')
    });
    robot.on('reset', function onReset() {
        console.log('GoPiGo is resetting')
    });
    robot.on('normalVoltage', function onNormalVoltage(voltage) {
        console.log('Voltage is ok [' + voltage + ']');
        if(_ref.callBacks){
            _ref.callBacks(APP.SOCKET_MESSAGE.VOLTAGE_NORMAL);
        }
    });
    robot.on('lowVoltage', function onLowVoltage(voltage) {
        console.log('(!!) Voltage is low [' + voltage + ']');
        if(_ref.callBacks){
            _ref.callBacks(APP.SOCKET_MESSAGE.VOLTAGE_LOW);
        }
    });
    robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
        console.log('(!!!) Voltage is critical [' + voltage + ']');
        if(_ref.callBacks){
            _ref.callBacks(APP.SOCKET_MESSAGE.VOLTAGE_CRITICAL);
        }
    });
    robot.init();


    this.init = function(){
        console.log("APP.RobotDAO init");
        if(_ref.callBacksInit){
            _ref.callBacksInit();
        }
    };
    this.getVoltage = function(){
        try{
            return (robot.board.getVoltage()  / 12);
        }catch(e){
            return 0;
        }
    };
    this.speedsMotors = function(isForward, speedMotorLeft, speedMotorRight){

        if(speedMotorLeft > 20 || speedMotorRight > 20){
            if(speedMotorLeft != speedLeft && Math.abs(speedMotorLeft-speedLeft) > 10){
                if(timeoutSpeedLeft != -1){
                    clearTimeout(timeoutSpeedLeft);
                }
                if(isRun){
                    timeoutSpeedLeft = setTimeout(function(){
                        robot.motion.setLeftSpeed(speedLeft);
                    }, timeoutSpeedValue);
                }else{
                    robot.motion.setLeftSpeed(speedLeft);
                }

            }
            if(speedMotorRight != speedRight && Math.abs(speedMotorRight-speedRight) > 10){
                if(timeoutSpeedRight != -1){
                    clearTimeout(timeoutSpeedRight);
                }
                if(isRun){
                    timeoutSpeedRight = setTimeout(function(){
                        robot.motion.setRightSpeed(speedRight);
                    }, timeoutSpeedValue);
                }else{
                    robot.motion.setRightSpeed(speedRight);
                }
            }
            speedLeft = speedMotorLeft;
            speedRight = speedMotorRight;
            if(!isRun){
                if(timeoutStop != -1){
                    clearTimeout(timeoutStop);
                }
                isRun = true;
                if(isForward){
                    robot.motion.forward(false);
                }else{
                    robot.motion.backward(false);
                }
            }

        }else{
            if(isRun){
                isRun = false;
                if(timeoutSpeedRight != -1){
                    clearTimeout(timeoutSpeedRight);
                }
                if(timeoutSpeedLeft != -1){
                    clearTimeout(timeoutSpeedLeft);
                }
                if(timeoutStop != -1){
                    clearTimeout(timeoutStop);
                }

                deccelerate(1);

            }

        }

    };

    function deccelerate(pass){
        var flag = false;
        if(speedLeft > 50){
            speedLeft = Math.floor(4*speedLeft / 3);
            robot.motion.setLeftSpeed(speedLeft);
        }else{
            speedLeft = 0;
            robot.motion.setLeftSpeed(speedLeft);
        }
        if(speedRight > 50){
            speedRight = Math.floor(4*speedRight / 3);
            robot.motion.setRightSpeed(speedRight);
        }else{
            speedRight = 0;
            robot.motion.setRightSpeed(speedRight);
        }
        if(flag){
            timeoutStop = setTimeout(function(){
                deccelerate(pass+1);
            }, Math.floor(((speedLeft > speedRight ? speedLeft : speedRight)*timeoutStopValue/255) ));
        }else{
            robot.motion.stop();
        }
    };
    function deccelerate2(pass){
        if(speedBoth >= 60){
            speedBoth -= 15;
            robot.motion.setSpeed(speedBoth);
            //robot.motion.decreaseSpeed(); // decrease of 10
            timeoutStop = setTimeout(function(){
                deccelerate2(pass+1);
            }, 40);
        }else{
            speedBoth = 50;
            robot.motion.stop();
        }
    };
    function accelerate2(pass){
        if(speedBoth < 250){
            speedBoth += 15;
            robot.motion.setSpeed(speedBoth);
            //robot.motion.increaseSpeed();
            timeoutStart = setTimeout(function(){
                accelerate2(pass+1);
            }, 40);
        }
    };
    this.fwd = function(){
        isMove = true;
        speedBoth = 100;
        robot.motion.setSpeed(speedBoth);
        robot.motion.forward(false);
        if(timeoutStop != -1){
            clearTimeout(timeoutStop);
        }
        if(timeoutStart != -1){
            clearTimeout(timeoutStart);
        }
        accelerate2(1);
    };
    this.backward = function(){
        isMove = true;
        speedBoth = 100;
        robot.motion.setSpeed(speedBoth);
        robot.motion.backward(false);
        if(timeoutStop != -1){
            clearTimeout(timeoutStop);
        }
        if(timeoutStart != -1){
            clearTimeout(timeoutStart);
        }
        accelerate2(1);
    };
    this.rotateLeft = function(){
        robot.motion.setSpeed(200);
        robot.motion.leftWithRotation();
    };
    this.rotateRight = function(){
        robot.motion.setSpeed(200);
        robot.motion.rightWithRotation();
    };
    this.stop = function(){
        if(isMove){
            isMove = false;
            if(timeoutStop != -1){
                clearTimeout(timeoutStop);
            }
            if(timeoutStart != -1){
                clearTimeout(timeoutStart);
            }
            deccelerate2(1);
        }else{
            robot.motion.stop();
        }
    };
    this.init();

    return this;

};
