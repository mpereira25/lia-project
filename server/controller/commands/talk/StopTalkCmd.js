APP.StopTalkCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        console.log('stop');
        APP.services.DevicesService.stopTalk();
        APP.services.socketController.sendAction('stopTalk', 'stopTalk');
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
