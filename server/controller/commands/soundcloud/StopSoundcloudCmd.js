APP.StopSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_stop', 'soundcloud_stop');
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
