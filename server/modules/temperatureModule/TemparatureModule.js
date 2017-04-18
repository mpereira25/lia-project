APP.TemperatureModule = (function(){

    var lastTemperature = {ext: 15, int: 19};
    var _ref = this;

    this.init = function(){

        // start check temperature
        APP.services.TemperatureService = new APP.TemperatureService();
        APP.services.TemperatureService.startCheckTemperature();
        APP.services.TemperatureService.addEventListener(APP.services.TemperatureService.ON_CHECK_TEMPERATURE, callBackCheck, _ref);

    }

    function callBackCheck(event, result) {
        var str = 'Il fait ' + (result.ext < 0 ? 'moins ' + Math.abs(result.ext) : result.ext) + ' degrés à lextérieur. Et ' + (result.int < 0 ? 'moins ' + Math.abs(result.int) : result.int) + ' degrés à linterieur.';
        var flag = false;

        // ext
        if(result.ext < -1 && lastTemperature.ext >= -1){
            str += ' Couvrez vous bien si vous sortez !';
            flag = true;
        }
        else if(result.ext < -5 && lastTemperature.ext >= -5){
            str += ' Couvrez vous bien si vous sortez !';
            flag = true;
        }
        else if(result.ext > 30 && lastTemperature.ext <= 30){
            str += ' Pensez à vous hydrater !';
            flag = true;
        }
        else if(result.ext > 35 && lastTemperature.ext <= 35){
            str += ' Pensez à vous hydrater !';
            flag = true;
        }

        // int
        if(result.int < 17 && lastTemperature.int >= 17){
            str = 'La température est anormalement basse dans le salon. ' + str;
            flag = true;
        }

        if(flag){
            APP.services.talkServeCtrl.speech(str);
        }

        lastTemperature.ext = result.ext;
        lastTemperature.int = result.int;
    }

    return this;

});
