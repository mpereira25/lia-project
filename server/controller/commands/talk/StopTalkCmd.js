APP.StopTalkCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        console.log('stop');
        APP.DevicesService.stopTalk();
        _ref.socketController.sendAction('stopTalk', 'stopTalk');
        APP.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
