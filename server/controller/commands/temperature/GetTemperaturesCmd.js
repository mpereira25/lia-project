APP.GetTemperaturesCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.TemperatureService.getTemperature().then(function(result){
            console.log('ext : ' + result.ext);
            console.log('int : ' + result.int);
            APP.services.talkServeCtrl.speech('Il fait ' + (result.ext < 0 ? 'moins ' + Math.abs(result.ext) : result.ext) + ' degrés à lextérieur. Et ' + (result.int < 0 ? 'moins ' + Math.abs(result.int) : result.int) + ' degrés à linterieur.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
