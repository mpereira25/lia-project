APP.GetTimeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        setTimeout(function(){
            APP.services.talkServeCtrl.speech(APP.services.DevicesService.getTime());
            resolve();
        }, 1000);
    }


    return this;

});
