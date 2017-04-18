APP.GetTemperatureExtCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.TemperatureService.getTemperature().then(function(result){
            APP.services.talkServeCtrl.speech(result.ext + ' degrés.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
