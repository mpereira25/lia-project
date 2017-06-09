import http from 'http';
import { Dispatcher } from 'flux';
import DatasEvent from '../evt/DatasEvent.js';
import MainModel from '../MainModel.js';

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
                        this.dispatcher.dispatch(DatasEvent.CONFIG_COMPLETE);
                        if(callback) {
                            callback();
                        }
                    });
                });
            });

        });
    }
    getLightsCmds () {
        const lightsObj = {};

        const nb = this.model.commandsJson.length;
        let i;
        let idLight;
        for( i = 0; i < nb; i++) {
            if(this.model.commandsJson[i].id.indexOf('light_on_') !== -1) {

                idLight = this.model.commandsJson[i].id.split('light_on_')[1];
                if(!lightsObj[idLight]) lightsObj[idLight] = {};
                lightsObj[idLight].on = this.model.commandsJson[i];

            }else if(this.model.commandsJson[i].id.indexOf('light_off_') !== -1) {

                idLight = this.model.commandsJson[i].id.split('light_off_')[1];
                if(!lightsObj[idLight]) lightsObj[idLight] = {};
                lightsObj[idLight].off = this.model.commandsJson[i];
            }
        }

        const list = [];
        for(let p in lightsObj) {
            list.push({
                name: p,
                on: lightsObj[p].on,
                off: lightsObj[p].off
            });
        }
        return list;

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
