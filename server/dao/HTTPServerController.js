var RSVP = require('rsvp');
var EventBus = require('eventbusjs');

APP.HTTPServerController = (function(){

    var _ref = this;

    this.addEventListener = function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    }
    this.removeEventListener = function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope);
    }

    this.getTemperatures = function(res, params) {
        return new RSVP.Promise(function(resolve, reject){

            if(params.refresh === 'true') {
                APP.services.TemperatureService.getTemperature().then(function(result){
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(APP.modules.TemperatureModule.lastTemperature));
                    res.end();

                    resolve();
                }).catch(function(){
                    resolve();
                });
            }else{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(APP.modules.TemperatureModule.lastTemperature));
                res.end();

                resolve();
            }

        });
    }

    return this;


})();
