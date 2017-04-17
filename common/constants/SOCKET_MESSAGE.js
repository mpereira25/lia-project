/**
 * Created by stellar on 03/04/2016.
 */
APP.SOCKET_MESSAGE = (function(){

    this.UP = 'UP';
    this.DOWN = 'DOWN';
    this.RIGHT = 'RIGHT';
    this.LEFT = 'LEFT';
    this.STOP = 'STOP';
    this.LEFTDOWN = 'LEFTDOWN';
    this.LEFTUP = 'LEFTUP';
    this.RIGHTDOWN = 'RIGHTDOWN';
    this.RIGHTUP = 'RIGHTUP';
    this.ANALOG = 'ANALOG';

    this.TALK = 'TALK';
    this.TALK_END = 'TALK_END';

    this.VOLTAGE_CHANGE = 'VOLTAGE_CHANGE';
    this.VOLTAGE_LOW = 'VOLTAGE_LOW';
    this.VOLTAGE_CRITICAL = 'VOLTAGE_CRITICAL';
    this.VOLTAGE_NORMAL = 'VOLTAGE_NORMAL';

    this.ROBOT_TURN_ARROUND = 'ROBOT_TURN_ARROUND';

    return this;
})();
