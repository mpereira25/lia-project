APP.GetTemperatureExtCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.SoundEmotionService.playSound('talk');
        APP.DevicesService.getTemperature().then(function(result){
            _ref.talkController.speech(result.ext + ' degrés.');
            resolve();
        }).catch(function(){
            resolve();
        });
    }


    return this;

});
