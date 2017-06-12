export default class MainModel {

    constructor() {
        this._configJson = {};
        this._commandsJson = [];

        this.lightCmds = [];
        this.customOnOffCmds = [];
        this.customCmds = [];
        this.secret = '';
        this.domain = '';
        this.temperatureExt = 0;
        this.temperatureInt = 0;
    }
    get configJson() {
        return this._configJson;
    }

    set configJson(value) {
        this._configJson = value;
    }

    get commandsJson() {
        return this._commandsJson;
    }

    set commandsJson(value) {
        this._commandsJson = value;
    }
}
