APP.GetTimeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.SoundEmotionService.playSound('talk');
        setTimeout(function(){
            _ref.talkController.speech(APP.DevicesService.getTime());
            resolve();
        }, 1000);
    }


    return this;

});
