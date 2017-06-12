import http from 'http';
import { Dispatcher } from 'flux';
import DatasEvent from '../evt/DatasEvent.js';
import MainModel from '../MainModel.js';
import HomeService from '../services/HomeService';

class MainModelController {

    constructor() {
        this.dispatcher = new Dispatcher();
        this.model = new MainModel();
    }


    getConfig (callback) {
        const paramsObj = this.getParamFromUrl(document.location.href);
        this.model.secret = paramsObj.key;
        this.model.domain = window.location.host.split(':')[0];

        http.get('/datas/config.json?key=' + this.model.secret, (response) => {
            // Continuously update stream with data
            if(response.statusCode === 404) {
                this.dispatcher.dispatch(DatasEvent.CONFIG_COMPLETE);
                if(callback) {
                    callback();
                }
                return;
            }
            var body = '';
            response.on('data', (d) => {
                body += d;
            });
            response.on('end', () => {
                this.model.configJson = JSON.parse(body);

                http.get('/datas/commands.json?key=' + this.model.secret, (response) => {
                    // Continuously update stream with data
                    body = '';
                    response.on('data', (d) => {
                        body += d;
                    });
                    response.on('end', () => {
                        this.model.commandsJson = JSON.parse(body);
                        this.parseLightsAndCustomCmds();

                        const homeService = new HomeService();
                        homeService.getTemperatures(false).then((result) => {
                            this.model.temperatureInt = result.int;
                            this.model.temperatureExt = result.ext;
                            this.dispatcher.dispatch(DatasEvent.CONFIG_COMPLETE);
                            if(callback) {
                                callback();
                            }
                        }).catch(() => {
                            this.dispatcher.dispatch(DatasEvent.CONFIG_COMPLETE);
                            if(callback) {
                                callback();
                            }
                        });
                    });
                });
            });

        });
    }

    parseLightsAndCustomCmds () {
        const lightsObj = {};
        const customOnOffObj = {};
        const listCustom = [];

        const nb = this.model.commandsJson.length;
        let i;
        let id;
        for( i = 0; i < nb; i++) {
            if(this.model.commandsJson[i].id.indexOf('light_on_') !== -1) {

                id = this.model.commandsJson[i].id.split('light_on_')[1];
                if(!lightsObj[id]) lightsObj[id] = {};
                lightsObj[id].on = this.model.commandsJson[i];

            }else if(this.model.commandsJson[i].id.indexOf('light_off_') !== -1) {

                id = this.model.commandsJson[i].id.split('light_off_')[1];
                if(!lightsObj[id]) lightsObj[id] = {};
                lightsObj[id].off = this.model.commandsJson[i];

            }else if(this.model.commandsJson[i].id.indexOf('custom_on_') !== -1) {

                id = this.model.commandsJson[i].id.split('custom_on_')[1];
                if(!customOnOffObj[id]) customOnOffObj[id] = {};
                customOnOffObj[id].on = this.model.commandsJson[i];

            }else if(this.model.commandsJson[i].id.indexOf('custom_off_') !== -1) {

                id = this.model.commandsJson[i].id.split('custom_off_')[1];
                if(!customOnOffObj[id]) customOnOffObj[id] = {};
                customOnOffObj[id].off = this.model.commandsJson[i];

            }else if(this.model.commandsJson[i].id.indexOf('custom_') !== -1) {

                listCustom.push(this.model.commandsJson[i]);
            }
        }

        const listLights = [];
        const listOnOffCustom = [];
        for(let p in lightsObj) {
            listLights.push({
                name: p,
                on: lightsObj[p].on,
                off: lightsObj[p].off
            });
        }
        for(let p in customOnOffObj) {
            listOnOffCustom.push({
                name: p,
                on: customOnOffObj[p].on,
                off: customOnOffObj[p].off
            });
        }

        this.model.lightCmds = listLights;
        this.model.customOnOffCmds = listOnOffCustom;
        this.model.customCmds = listCustom;
    }

    getTemperatures () {
        const homeService = new HomeService();
        return homeService.getTemperatures(true).then((result) => {
            this.model.temperatureInt = result.int;
            this.model.temperatureExt = result.ext;

            return result;
        }).catch(() => {

        });
    }

    getParamFromUrl(url) {
      var paramsObj = {};

      if(!url) {
        return {};
      }

      var params = url.split('?');
      if(params.length > 1) {
        var paramsTab = params[1].split('&');
        var nb = paramsTab.length;
        var paramsObj = {};
        var paramPair;
        var i;
        for(i = 0; i < nb ; i++){
            paramPair = paramsTab[i].split('=');
            paramsObj[paramPair[0]] = paramPair[1];
        }
      }


      return paramsObj;
    }

}

export default new MainModelController();
